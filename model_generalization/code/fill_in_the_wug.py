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
parser.add_argument('--model_name', default="bert-base-cased", help=f"Select the model to use, currently supports {list(mask_dictionary.keys())}")
parser.add_argument('--mask_whole_word', default=False, help="Boolean to mask the whole nonce root or only mask what follows.")
parser.add_argument('--force_sentence', help="Putting a sentence of the form 'Something something YYY' will cause the script to only fill this sentence and ignore th input datasets.")

args = parser.parse_args()
context_file = args.context_file
nonce_file = args.nonce_file
model_name = args.model_name
mask_whole_word = args.mask_whole_word
force_sentence = args.force_sentence


tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelWithLMHead.from_pretrained(model_name)

fill_mask = pipeline(
    "fill-mask",
    model=model,
    tokenizer=tokenizer
)


def read_file(file_name):
    with open(file_name) as f:
        for line in f.readlines():
            l = line.strip()
            if len(l) < 1:
                continue
            yield l

def _get_data_set():
    dataset = []
    for context in read_file(context_file):
        for nonce in read_file(nonce_file):
            num_masks = context.count("YYY")
            if mask_whole_word:
                sample = context.replace("XXX", nonce).replace("YYY", mask_dictionary[model_name]).lstrip()
            else:
                sample = context.replace("XXX", nonce).replace("YYY", nonce+mask_dictionary[model_name]).lstrip()

            dataset.append((num_masks, sample))

    return dataset


def get_fills(datapoints):
    fills = []
    for datum in datapoints:
        filled = fill_mask(datum)
        fills.append(filled)
    return fills


def generation_task(dataset):
    for num_masks, sample in dataset:
        if num_masks == 2:
            split_int = sample.find(".", sample.find(mask_dictionary[model_name])) + 1
            first_filled = get_fills([sample[:split_int]])
            second_samples = []
            for datum in first_filled[0]:
                prev_fill = datum['sequence'][6:-6]
                second_samples.append(prev_fill+sample[split_int:])
            filled = get_fills(second_samples)
            pprint(filled)

        elif num_masks == 1:
            filled = get_fills([sample])
            pprint(filled)


### MAIN ###

if force_sentence:
    num_masks = force_sentence.count("YYY")
    sample = force_sentence.replace("YYY", mask_dictionary[model_name]).lstrip()
    dataset = [(num_masks, sample)]
else:
    dataset = _get_data_set()


generation_task(dataset)
