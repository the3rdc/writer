from dotenv import load_dotenv
load_dotenv()
import os
from openai import AzureOpenAI

client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_KEY"),  
    api_version="2024-10-21",
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)

response_format = {
    "type": "json_schema",
    "json_schema": {
        "name": "autocomplete_response",
        "schema": {
            "type": "object",
            "properties": {
                "prediction":{
                    "type": "string",
                    "description": "The predicted completion for the input text."
                }
            },
            "required": ["prediction"],
            "additionalProperties": False
        },
        "strict": True,
    }
}

instructions = """
You are providing an auto complete service to assist users in writing any kind of document.
All "user role" content passed to you will be content they are writing.
You should review content to understand:
- the topic and context of the document
- the users personal style and tone of writing
- the users intent for the document
and provide a completion that is consistent with the above.

Notes:
- The goal of this application is to assist users in writing documents, not to generate new content.
  - Thereore, limit the length of your suggestion to finishing the current sentance, or suggesting the next.
  - In cases where your confidence is extremely high (repeated forms, common references, etc) you may suggest a few sentences.
- The purpose here is to anticipate what the user will write next, not suggest a direction or enforce a style.
  - So put high importance on matching the users style and tone.
"""

def get_suggestions(prompt: str, max_tokens: int = 100) -> dict:
    """
    Get suggestions from the model.
    """
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": instructions},
            {"role": "user", "content": prompt}
        ],
        max_tokens=max_tokens,
        temperature=0.7,
        response_format=response_format
    )
    return completion.choices[0].message

print(get_suggestions("It was a dark and"))