from fastapi import FastAPI, Depends, FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from dotenv import load_dotenv
import os
load_dotenv()

from omni.helpers import (
    supabase,
    require_auth, RequireProductSubscription,
    create_checkout_session, verify_checkout_session,
    get_settings, set_settings,
    get_items, get_item, create_item, delete_item,
    set_item_content, set_item_meta
)

from .suggest import get_suggestions

app = FastAPI()

origins = [
    "http://localhost:3000",
    "https://your-production-domain.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/purchase")
def purchase(user_id: str, product_name: str):
    """
    Endpoint to purchase a product.
    """
    session = create_checkout_session(user_id, product_name, f"{os.getenv("HOST")}complete-purchase", os.getenv("HOST"))
    print(session)
    url = session.url
    # redirect to the checkout page
    return RedirectResponse(url, status_code=303)

    
@app.get("/complete-purchase")
def complete_purchase(user_id: str, session_id: str, product_name: str):
    """
    Endpoint to complete the purchase.
    """
    session = verify_checkout_session(user_id, session_id, product_name)
    print(session)
    return RedirectResponse(os.getenv("HOST"), status_code=303)

PRODUCT = "writer"

@app.get("/subscription")
def get_subscription_endpoint(sub = Depends(RequireProductSubscription(PRODUCT))):
    """
    Endpoint to get subscription for a user.
    """
    (user, subscription) = sub
    return subscription

@app.get("/settings")
def get_settings_endpoint(product_name: str = PRODUCT, user = Depends(require_auth)):
    """
    Endpoint to get settings for a user.
    """
    settings = get_settings(user.user.id, product_name)
    return settings

@app.post("/settings")
def set_settings_endpoint(settings: dict, product_name: str = PRODUCT, user = Depends(require_auth)):
    """
    Endpoint to set settings for a user.
    """
    set_settings(user.user.id, product_name, settings)
    return {"status": "ok"}

@app.get("/items")
def get_items_endpoint(
    product_name: str = PRODUCT, 
    item_type: str = None, 
    include_meta: bool = False, 
    include_content: bool = False, 
    user = Depends(require_auth)):
    """
    Endpoint to get items for a user.
    """
    items = get_items(user.user.id, product_name, item_type, include_meta, include_content)
    return items

@app.get("/items/{item_id}")
def get_item_endpoint(
    item_id: str, 
    include_meta: bool = False, 
    include_content: bool = False, 
    user = Depends(require_auth)):
    """
    Endpoint to get a specific item for a user.
    """
    item = get_item(user.user.id, item_id, include_meta, include_content)
    return item

class ItemCreateRequest(BaseModel):
    item_type: Optional[str] = None
    meta: Optional[dict] = None
    content: Optional[str] = None

@app.post("/items")
def create_item_endpoint(
    body: ItemCreateRequest,
    product_name: str = PRODUCT,
    user = Depends(require_auth)):
    """
    Endpoint to create an item for a user.
    """
    item = create_item(user.user.id, product_name, body.item_type, body.meta, body.content)
    return item

class ItemUpdateRequest(BaseModel):
    content: Optional[str] = None

@app.post("/items/{item_id}/content")
def set_item_content_endpoint(
    item_id: str, 
    body: ItemUpdateRequest,
    user = Depends(require_auth)):
    """
    Endpoint to set the content of an item for a user.
    """
    set_item_content(user.user.id, item_id, body.content)
    return {"status": "ok"}

@app.post("/items/{item_id}/meta")
def set_item_meta_endpoint(
    item_id: str, 
    meta: dict, 
    user = Depends(require_auth)):
    """
    Endpoint to set the meta of an item for a user.
    """
    set_item_meta(user.user.id, item_id, meta)
    return {"status": "ok"}

@app.delete("/items/{item_id}")
def delete_item_endpoint(
    item_id: str, 
    product_name: str = PRODUCT, 
    user = Depends(require_auth)):
    """
    Endpoint to delete an item for a user.
    """
    delete_item(user.user.id, product_name, item_id)
    return {"status": "ok"}


class SuggestRequest(BaseModel):
    content: str
    save_content: Optional[bool] = False

@app.post("/items/{item_id}/suggest")
def get_suggestion(
    item_id: str, 
    body: SuggestRequest, 
    user = Depends(require_auth)):
    """
    Endpoint to get suggestions for a user.
    """
    item = get_item(user.user.id, item_id, include_meta=True)
    if not item:
        return {"status": "error", "message": "Item not found"}
    
    # Get the suggestions from the model
    suggestion = get_suggestions(body.content)
    
    # Save the suggestions to the item if requested
    # Todo - this should be in a background task
    if body.save_content:
        set_item_content(user.user.id, item_id, body.content)

    #if the content ends in a space and the suggestion starts with a space, remove it
    if body.content.endswith(" ") and suggestion['prediction'].startswith(" "):
        suggestion['prediction'] = suggestion['prediction'][1:]
    
    return suggestion