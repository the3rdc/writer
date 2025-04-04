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