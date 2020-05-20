
nonce_file = "./pilot-nonce-roots.txt"
noun_file = "./pilot-noun-contexts.txt"
verb_file = "./pilot-verb-contexts.txt"
adjective_file = "./pilot-adjective-contexts.txt"
stimuli_file = "./pilot-nonce-stimuli.txt"

def read_file(file_name):
    category = file_name.split("-")[1]
    items = []
    with open(file_name) as f:
        for line in f.readlines():
            l = line.strip()
            if len(l) >= 1:
                items.append((category,l))
    return items

def create_stimuli(roots, contexts):
    stimuli = []
    for i, (item,root) in enumerate(roots):
        condition = i + 1
        for category,context in contexts:
            prompt = context.replace("XXX", root)
            prompts = prompt.split("YYY")
            if len(prompts) < 3:
                stimulus = "{condition: \"" + str(condition) + "\", item: \"" + item + "\", category: \"" + category + "\", context: \"" + context + "\", root: \"" + root + "\", prompt1: \"" + prompts[0] + "\", prompt2: \"" + prompts[1] + "\"}"
            else:
                stimulus = "{condition: \"" + str(condition) + "\", item: \"" + item + "\", category: \"" + category + "\", context: \"" + context + "\", root: \"" + root + "\", prompt1: \"" + prompts[0] + "\", prompt2: \"" + prompts[1] + "\", prompt3: \"" + prompts[2] +"\"}"
            stimuli.append(stimulus)
            condition = (condition + 1) % 30
    return stimuli


### MAIN ###
roots = read_file(nonce_file)
contexts = read_file(noun_file) + read_file(verb_file) + read_file(adjective_file)
stimuli = create_stimuli(roots, contexts)

with open(stimuli_file, "w") as f:
    for stimulus in stimuli:
        f.write(stimulus)
        f.write(",\n")
