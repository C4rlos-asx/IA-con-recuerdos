from openai import OpenAI

client = OpenAI(api_key="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")

modelos = client.models.list()

print(f"📚 Total de modelos: {len(modelos.data)}\n")

for modelo in modelos.data:
    print(f"• {modelo.id}")