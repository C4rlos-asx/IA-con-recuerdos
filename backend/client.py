from google import genai

# Inicializa el cliente
client = genai.Client(api_key="AIzaSyCOI13jN-IrDm0uL5PLw2Cjuf6F4360Rpk")

for model in client.models.list():
    # ¡Inspecciona el objeto completo!
    print(model)
    # Una vez que veas el nombre del atributo correcto, úsalo en tu 'if'