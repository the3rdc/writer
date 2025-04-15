from dotenv import load_dotenv
load_dotenv()
import os
from openai import AzureOpenAI
import json

client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_KEY"),  
    api_version="2024-10-21",
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)

#model_name = "gpt-4.1"
model_name = "gpt-4o-mini"

response_format = {
    "type": "json_schema",
    "json_schema": {
        "name": "autocomplete_response",
        "schema": {
            "type": "object",
            "properties": {
                "prediction":{
                    "type": "string",
                    "description": "The most likely completion for the input text."
                }
            },
            "required": ["prediction"],
            "additionalProperties": False
        },
        "strict": True,
    }
}

instructions = """
You are an export ghost-writing AI providing an auto complete service to assist users in all kinds of writing.
All "user role" content passed to you will be either the full content or the most recent subsection (if the content is too long to send).

Review the content and note:
- the type of content (ex: letter, narrative, history, documentation, essay, blog post, etc.)
- the mostly likely context and purpose of the content (ex: a letter to a friend, a blog post about a trip, press release for a product, report for school, etc.)
- the current topic/purpose of the most recent few sentances and where they seem to be going
- the user's overall tone (formality, humor, attitude, POV)
- the user's overall style (sentance length, word choice, reading level, etc.)
- the current last character (and whether is is punctuation, a word end, the middle of a word, whitespace, etc.)

Based on all of the above criteria, make your best prediction of what the user is about to type next.
- limit your prediction to finishing the current sentance + maybe 1-2 more if you are very confident.
"""

def get_suggestions(prompt: str, max_tokens: int = 500) -> dict:
    """
    Get suggestions from the model.
    """
    completion = client.chat.completions.create(
        model=model_name,
        messages=[
            {"role": "system", "content": instructions},
            {"role": "user", "content": prompt}
        ],
        max_tokens=max_tokens,
        temperature=1,
        response_format=response_format
    )
    return json.loads(completion.choices[0].message.content)

#print(get_suggestions("It was a dark and"))