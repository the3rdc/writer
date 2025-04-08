"""
The point on Omni is to super simplify backend development for my many ADHD brain projcets.

As such, we built it on supabase becuase it gives you both auth and DB and some other things.
- Probably not the best for price or perf but it's quick to set up.

We will only have a few tables and all apps will use them.

1) user_products
- maps users to the products they currently have
- has a user_id, a product_name, and a stripe subscription id

2) user_settings
- maps users to their settings for a project
- has a user_id, a product_name, and a single JSON field for settings.

3) user_items
- all "entities" are stored here
- user_id, product_name, item_id, item_type, item_meta (JSON), item_content (text)
(we reserve the right to add more fields later for convenience, but will be judicious about it)


We will have a few helpers

1) require_auth - dependency for endpoints that need to have a logged in user
- returns 401 if there is not one

2) require_product - dependency for endpoints that require the user to have purchased the product
- checks for a matching record
- if found, checks that the stripe sub is active/valid
- if not returns a specific status code indicating purchase required
- otherwise provides the subscription info to the endpoint

3) get settings - takes user and product and returns their settings as a dict
- or an empty dict if no settings
- optionally allows a default to be provided which will be returned instead of empty dict

4) get items - takes a user and product and returns all items
- optionally take an item type and returns all items of that type
- does not return meta or content by defualt, but flags can tell it to include them

5) get item - takes a user and item id and returns the item
- by default returns all fields

6) set settings - takes a user, product and new settings
- creates or updates the settings for that user/product

7) set item meta
- takes user, item id and new meta and updates item (throws error if not exist)
- updates updated_at field

8) set item content
- takes user, item id and new meta and updates item (throws error if not exist)
- updates updated_at field

9) create item 
- takes user, product_name, item_type, and optionally meta and optionall content and creates new item
"""

from fastapi import Depends, HTTPException
from supabase import create_client, Client
import stripe

from dotenv import load_dotenv
import os
from fastapi.security import OAuth2PasswordBearer

from typing import Annotated

load_dotenv()

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def require_auth(token: Annotated[str, Depends(oauth2_scheme)]):
    try:
        user = supabase.auth.get_user(token)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

def check_for_product_record(user_id: str, product_name: str):
    """
    Check if the user has a record for the specified product.
    """
    product = supabase.table("user_products").select("*").eq("user_id", user_id).eq("product_name", product_name).single().execute()
    print(product)
    if not product:
        return None
    return product.data

def check_subscription_status(stripe_subscription_id: str):
    """
    Check if the subscription is active or trialing.
    """
    try:
        subscription = stripe.Subscription.retrieve(stripe_subscription_id)
        if subscription.status in ["active", "trialing"]:
            return True
        return False
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
def check_user_subscription(user_id: str, product_name: str):
    """
    Check if the user has a subscription for the specified product.
    """
    product = check_for_product_record(user_id, product_name)
    if not product:
        return False

    stripe_sub_id = product["data"]["stripe_subscription_id"]
    if not stripe_sub_id:
        return False

    subscription = stripe.Subscription.retrieve(stripe_sub_id)
    return subscription

class RequireProductSubscription:
    def __init__(self, product_name: str):
        self.product_name = product_name

    def __call__(self, token: Annotated[str, Depends(oauth2_scheme)]):
        try:
            user = supabase.auth.get_user(token)
            if not user:
                raise HTTPException(status_code=401, detail="Invalid token")
            
            # Check if the user has access to the specified product
            subscription = check_user_subscription(user.user.id, self.product_name)
            if not subscription:
                raise HTTPException(status_code=402, detail="Payment required")
            
            if subscription.status not in ["active", "trialing"]:
                raise HTTPException(status_code=402, detail="Payment required")
            
            return (user, subscription)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        
PRODUCT_LIST = {
    "writer": {
        "name": "Writer",
        "description": "Auto complete for anything. Customized to your style.",
        "price_id": "price_1R9UWWFCUaUjKa7SqpbwYLF3"

    }
}

def create_checkout_session(user_id: str, product_name: str, success_url: str, cancel_url: str):
    try:
        # Check if the product exists
        if product_name not in PRODUCT_LIST:
            raise HTTPException(status_code=404, detail="Product not found")
    
        # Create a checkout session
        checkout_session = stripe.checkout.Session.create(
            line_items=[
                {
                    "price": PRODUCT_LIST[product_name]["price_id"],
                    "quantity": 1,
                }
            ],
            mode="subscription",
            subscription_data={
                "trial_period_days": 7,
            },
            success_url=success_url+"?session_id={CHECKOUT_SESSION_ID}&user_id="+user_id+"&product_name="+product_name,
            cancel_url=cancel_url,
        )
       
        return checkout_session
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
def verify_checkout_session(user_id: str, session_id: str, product_name: str):
    print("Here")
    try:
        # Retrieve the session
        print("DUDe")
        checkout_session = stripe.checkout.Session.retrieve(session_id)
        print(checkout_session)
        product = check_for_product_record(user_id, product_name)

        print(checkout_session)

        print(product)
       
        if not product:
            # Create a new record for the user
            supabase.table("user_product").insert({
                "user_id": user_id,
                "product_name": product_name,
                "stripe_subscription_id": checkout_session['subscription'],
            }).execute()
        else:
            # Update the existing record
            supabase.table("user_product").update({
                "stripe_subscription_id": checkout_session['subscription']
            }).eq("user_id", user_id).eq("product_name", product_name).execute()

        return True
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
def get_settings(user_id: str, product_name: str, default=None):
    """
    Get the settings for a user and product.
    """
    settings = supabase.table("user_settings").select("*").eq("user_id", user_id).eq("product_name", product_name).maybe_single().execute()
    if not settings:
        return default or {}
    return settings.data["settings"]

def get_items(user_id: str, product_name: str, item_type: str = None, include_meta: bool = False, include_content: bool = False):
    """
    Get all items for a user and product.
    """
    query = supabase.table("user_items")

    if not include_meta and not include_content:
        query = query.select("item_id, item_type, updated_at")
        
    elif not include_content and include_meta:
        query = query.select("item_id, item_type, updated_at, item_meta")
    
    elif include_content and not include_meta:
        query = query.select("item_id, item_type, updated_at, item_content")
    
    else:
        query = query.select("*")

    if item_type:
        query = query.eq("item_type", item_type)
    
    query = query.eq("user_id", user_id).eq("product_name", product_name)
    
    items = query.execute()
    
    return items.data

def get_item(user_id: str, item_id: str, include_meta: bool = True, include_content: bool = True):
    """
    Get a specific item for a user.
    """
    query = supabase.table("user_items")
    
    if not include_meta and not include_content:
        query = query.select("item_id, item_type, updated_at")
        
    elif not include_content and include_meta:
        query = query.select("item_id, item_type, updated_at, item_meta")
    
    elif include_content and not include_meta:
        query = query.select("item_id, item_type, updated_at, item_content")
    
    else:
        query = query.select("*")

    query = query.eq("user_id", user_id).eq("item_id", item_id)
    
    item = query.single().execute()
    
    return item.data

def set_settings(user_id: str, product_name: str, settings: dict):
    """
    Set the settings for a user and product.
    """
    existing_settings = supabase.table("user_settings").select("*").eq("user_id", user_id).eq("product_name", product_name).single().execute()
    
    if existing_settings:
        supabase.table("user_settings").update({
            "settings": settings
        }).eq("user_id", user_id).eq("product_name", product_name).execute()
    else:
        supabase.table("user_settings").insert({
            "user_id": user_id,
            "product_name": product_name,
            "settings": settings
        }).execute()

def set_item_meta(user_id: str, item_id: str, meta: dict):
    """
    Set the meta for a specific item for a user.
    """
    supabase.table("user_items").update({
        "item_meta": meta,
        "updated_at": "now()"
    }).eq("user_id", user_id).eq("item_id", item_id).execute()

def set_item_content(user_id: str, item_id: str, content: str):
    """
    Set the content for a specific item for a user.
    """
    supabase.table("user_items").update({
        "item_content": content,
        "updated_at": "now()"
    }).eq("user_id", user_id).eq("item_id", item_id).execute()

def create_item(user_id: str, product_name: str, item_type: str, meta: dict = None, content: str = None):
    """
    Create a new item for a user and product.
    supabase will auto-generate the item_id.
    """
    
    result = supabase.table("user_items").insert({
        "user_id": user_id,
        "product_name": product_name,
        "item_type": item_type,
        "item_meta": meta or {},
        "item_content": content or ""
    }).execute()

    return result.data

def delete_item(user_id: str, item_id: str):
    """"
    Delete a specific item for a user.
    """
    supabase.table("user_items").delete().eq("user_id", user_id).eq("item_id", item_id).execute()