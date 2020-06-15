library(tools)
library(glue)
library(broom)
library(stringr)
library(tidyverse)
library(lme4)
library(modelr)
library(purrr)


my_get_transcript_results <- function(file){
  df = read.csv(file)
  #Extract child name from file name and add variable.
  file_name = strsplit(file_path_sans_ext(file), "/")[[1]]
  name = file_name[(length(file_name))]
  df = df %>%
    mutate(participant = name)
  return(df)
}

my_get_prod_results <- function(result_dir){
  files = list.files(path=result_dir, pattern="*.csv", full.names=TRUE, recursive=FALSE)
  df.prod_results = files %>% map(my_get_transcript_results) %>% reduce(rbind)
  return(df.prod_results)
}

result_dir = "../../data/01_experiment/condition1_results/"
df.condition1 = my_get_prod_results(result_dir)

summary(df.condition1)

#Find cases to reject 
df.fillers <- df.condition1 %>% filter(condition %in% c("filler", "training")) %>% 
  select(participant, response1, response2, root, context)

#remove 28 -bot 
#10cond - filled all new words
#12cond - nonsense
#14cond - nonsense
#19cond - no morphology
#9cond - no morphology
exclusions = c("28cond-trials", "10cond-trials", "12cond-trials", "14cond-trials", "19cond-trials", "9cond-trials") 

`%notin%` <- Negate(`%in%`)
df.condition1_selected <- df.condition1 %>% filter(participant %notin% exclusions)

summary(df.condition1_selected)

write.table(df.condition1_selected, file="condition1_selected.csv", sep=",", row.names =FALSE)

df.condition1_eval = read.csv(file="condition1_selected.csv", sep ="\t")

#done = c("0cond-trials", "11cond-trials", "13cond-trials","15cond-trials","16cond-trials", "17cond-trials")


summary(df.condition1_eval)

### HELPER FUNCTIONS TO CODE SOME OF THE RESPONSES AUTOMATICALLY

plural_noun_type = function(response, root){
  type = 0
  
  if(length(grep(root, response, ignore.case=TRUE))>=1){
    if(length(grep("s$", response, fixed=FALSE))>=1){
      type = 1
    }
  }else{
    if(length(grep("s$", response, fixed=FALSE))>=1){
      type = 2
    }
  }
  return(type)
}

past_verb_type = function(response, root){
  type = 0
  
  if(length(grep(root, response, ignore.case=TRUE))>=1){
    if(length(grep("ed$", response, fixed=FALSE))>=1){
      type = 1
    }
  }else{
    if(length(grep("ed$", response, fixed=FALSE))>=1){
      type = 2
    }
  }
  return(type)
}

participle_verb_type = function(response, root){
  type = 0
  
  if(length(grep(root, response, ignore.case=TRUE))>=1){
    if(length(grep("ing$", response, fixed=FALSE))>=1){
      type = 1
    }
  }else{
    if(length(grep("ing$", response, fixed=FALSE))>=1){
      type = 2
    }
  }
  return(type)
}


super_adjective_type = function(response, root){
  type = 0
  
  if(length(grep(root, response, ignore.case=TRUE))>=1){
    if(length(grep("est$", response, fixed=FALSE))>=1){
      type = 1
    }
  }else{
    if(length(grep("est$", response, fixed=FALSE))>=1){
      type = 2
    }
  }
  return(type)
}

comp_adjective_type = function(response, root){
  type = 0
  
  if(length(grep(root, response, ignore.case=TRUE))>=1){
    if(length(grep("er$", response, fixed=FALSE))>=1){
      type = 1
    }
  }else{
    if(length(grep("er$", response, fixed=FALSE))>=1){
      type = 2
    }
  }
  return(type)
}


annotate_response_types= function(data){
  category = unique(data$category)
  if(category == "noun"){
    data <- data %>% ungroup() %>% mutate(
      response1_type= map2(response1, root, plural_noun_type),
      response2_type= NA
    )
  }else if(category == "verb"){
    data <- data %>% ungroup() %>% mutate(
      response1_type= map2(response1, root, participle_verb_type),
      response2_type= map2(response2, root, past_verb_type)
    )
  }else if(category == "adjective"){
    data <- data %>% ungroup() %>% mutate(
      response1_type= map2(response1, root, super_adjective_type),
      response2_type= map2(response2, root, comp_adjective_type)
    )
  }
  return(data)
}

df.condition1_partial_annot <- df.condition1_eval %>% group_by(category) %>% split( .$category) %>% 
  map(~ annotate_response_types(data = .)) %>% reduce(rbind)



df.condition1_eval <- df.condition1_eval %>% filter(participant %in% done) %>% 
  mutate(response1_type = as.factor(response1_type), 
         response2_type = as.factor(response2_type)) 
summary(df.condition1_eval)

df.condition1_response_types  <- df.condition1_eval %>% 
  select(response1_type,response2_type)

summary(df.condition1_response_types)
  
