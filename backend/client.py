from google import genai

client = genai.Client(api_key="AIzaSyCOI13jN-IrDm0uL5PLw2Cjuf6F4360Rpk")

for model in client.models.list():

    print(model)
