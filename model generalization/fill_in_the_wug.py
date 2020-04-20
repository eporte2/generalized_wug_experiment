from transformers import pipeline, AutoTokenizer, AutoModelWithLMHead
import argparse
from pprint import pprint


mask_dictionary = {
    "bert-base-uncased" : "[MASK]",
    "bert-base-cased" : "[MASK]",
    "bert-large-uncased": "[MASK]",
    "bert-large-cased" : "[MASK]",
    "roberta-base" : "<mask>",
    "roberta-large" : "<mask>"
}

parser = argparse.ArgumentParser(description='Process some integers.')

parser.add_argument('--context_file', help="The path to a context file if using pre-written contexts")
parser.add_argument('--nonce_file', help='The path to a nonce file if using a list of nonces')
parser.add_argument('--model', default="bert-base-cased", help=f"Select the model to use, currently supports {list(mask_dictionary.keys())}")
parser.add_argument('--force-sentence', help="Putting a sentence of the form 'Something something YYY' will cause the script to only fill this sentence and ignore th input datasets.)

args = parser.parse_args()

tokenizer = AutoTokenizer.from_pretrained(args.model)			
model = AutoModelWithLMHead.from_pretrained(args.model)

def _load_data_set(args):
    with open(args.context_file, 'r') as f:
        # read in contexts
        contexts = f.readlines()
        
        # prune empty lines
        contexts = [x.strip() for x in contexts if x != ""]

    with open(args.nonce_file, 'r') as f:
        # read in contexts
        nonces = f.readlines()
        # prune empty lines
        nonces = [x.strip() for x in nonces if x != ""]

    dataset = []
    for context in contexts:
        for nonce in nonces:
            sample = context.replace("XXX", nonce).replace("YYY", mask_dictionary[args.model]).lstrip()
            dataset.append(sample)

    return dataset


if args.force_sentence:
    dataset = [args.force_sentence.replace("YYY", mask_dictionary[args.model]).lstrip()]
else:
    dataset = _load_data_set(args)


fill_mask = pipeline(
    "fill-mask",
    model=model,
    tokenizer=tokenizer
)

for datapoint in dataset:
    filled = fill_mask(datapoint)
    pprint(filled)
