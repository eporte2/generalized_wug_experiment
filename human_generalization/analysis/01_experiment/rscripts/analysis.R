library(tools)
library(lme4)
library(ggplot2)
library(tidyverse)
library(purrr)
source("helpers.R")
theme_set(theme_bw())

### Load in annotated data from experiment 1 and 1a 

df.exp1_annotated = read.csv(file="condition1_selected_annotated.csv", sep ="\t")
df.exp1a_annotated = read.csv(file="condition1a_selected_annotated.csv", sep ="\t")

### Load context morpheme dictionaries

df.exp1_contexts = read.csv(file="exp1_context_morph.csv", sep ="\t")
df.exp1a_contexts = read.csv(file="exp1a_context_morph.csv", sep ="\t")

### add expected morpheme type to responses
df.exp1_morph <- left_join(df.exp1_annotated, df.exp1_contexts) %>% 
  select(-c(irregular, prompt)) %>% 
  filter(condition %notin% c("training", "filler"))
df.exp1a_morph <- left_join(df.exp1a_annotated, df.exp1a_contexts) %>% 
  filter(condition %notin% c("training", "filler"))

### Combine responses 1 and 2 into a single column 

df.exp1_resp1 <- df.exp1_morph %>% select(-c(response2, response2_type, morph2)) %>% 
  mutate(response = response1, 
         response_type = as.factor(response1_type), 
         morpheme = morph1) %>% 
  select(-c(response1, response1_type, morph1))

df.exp1_resp2 <- df.exp1_morph %>% select(-c(response1, response1_type, morph1)) %>% 
  filter(!is.na(response2)) %>% 
  mutate(response = response2, 
         response_type = as.factor(response2_type), 
         morpheme = morph2) %>% 
  select(-c(response2, response2_type, morph2))

df.exp1a_resp1 <- df.exp1a_morph %>% select(-c(response2, response2_type, morph2)) %>% 
  mutate(response = response1, 
         response_type = as.factor(response1_type), 
         morpheme = morph1) %>% 
  select(-c(response1, response1_type, morph1))

df.exp1a_resp2 <- df.exp1a_morph %>% select(-c(response1, response1_type, morph1)) %>% 
  filter(!is.na(response2)) %>% 
  mutate(response = response2, 
         response_type = as.factor(response2_type), 
         morpheme = morph2) %>% 
  select(-c(response2, response2_type, morph2))

df.exp1 <- full_join(df.exp1_resp1, df.exp1_resp2)
df.exp1a <- full_join(df.exp1a_resp1, df.exp1a_resp2)


### ANALYSIS ###

# Proportion of each answer type (for each experiment)

df.exp1_prop = df.exp1 %>% select(response_type) %>% 
  group_by(response_type) %>% 
  summarise(n=n()) %>%
  ungroup() %>% 
  mutate(total = sum(n)) %>% 
  mutate(prop = n/total,
         exp = "exp1")

df.exp1a_prop = df.exp1a %>% select(response_type) %>% 
  group_by(response_type) %>% 
  summarise(n=n()) %>%
  ungroup() %>% 
  mutate(total = sum(n)) %>% 
  mutate(prop = n/total,
         exp = "exp1a")

df.prop <- full_join(df.exp1_prop, df.exp1a_prop)

# Proportion by morpheme (for each experiment)

df.exp1_morph_prop = df.exp1 %>% select(response_type, morpheme) %>% 
  group_by(morpheme,response_type) %>% 
  summarise(n=n()) %>%
  ungroup() %>% 
  group_by(morpheme) %>% 
  mutate(total = sum(n)) %>% 
  mutate(prop = n/total,
         exp = "exp1")

df.exp1a_morph_prop = df.exp1a %>% select(response_type, morpheme) %>% 
  group_by(morpheme,response_type) %>% 
  summarise(n=n()) %>%
  ungroup() %>%
  group_by(morpheme) %>%
  mutate(total = sum(n)) %>% 
  mutate(prop = n/total,
         exp = "exp1a")

df.morph_prop <- full_join(df.exp1_morph_prop, df.exp1a_morph_prop)

# Model response_type ~ root + context + (1|participant) for each experiment

m = glm(response_type ~ 1, data=df.exp1, family="binomial")
summary(m)

m = glm(response_type ~ 1 + category, data=df.exp1, family="binomial")
summary(m)

m = glmer(response_type ~ 1 + category + (1|participant), data=df.exp1, family="binomial")
summary(m)

m = glmer(response_type ~ 1 + category + (1|participant) + (1|root) + (1|context), data=df.exp1, family="binomial")
summary(m)


# Model response_type ~ experiment + (1|participant_exp)

df.exp1 <- df.exp1 %>% mutate(exp = "exp1")
df.exp1a <- df.exp1a %>% mutate(exp = "exp1a")

data <- full_join(df.exp1, df.exp1a)

m = glm(response_type ~ 1 + exp, data=data, family="binomial")
summary(m)

m = glmer(response_type ~ 1 + exp + (1|participant) + (1|root) + (1|context), data=data, family="binomial")
summary(m)

m = glmer(response_type ~ 1 + category + (1|participant) + (1|root) + (1|context) + (1|exp), data=data, family="binomial")
summary(m)


### VISUALIZATION ###

theme_set(theme_bw())

ggplot(df.prop, aes(x=response_type,y=prop, fill = exp))+geom_bar(stat="identity", position=position_dodge()) + ylab("Proportion of responses") + xlab("Response type") +


ggplot(df.morph_prop, aes(x=response_type,y=prop, fill = morpheme))+geom_bar(stat="identity", position=position_dodge())+facet_wrap(vars(exp))
  