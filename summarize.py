# Trying to use anything at this point
from transformers import pipeline
import torch

# Check if GPU is available
print(torch.cuda.is_available())
print(torch.cuda.get_device_name(0))

model = pipeline("summarization", model="facebook/bart-large-cnn", device=0)

def summarize(prompt):
    response = model(prompt)
    return response