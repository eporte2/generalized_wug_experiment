library(tools)
library(tidyverse)
library(purrr)


### HELPER FUNCTIONS ###

my_get_transcript_results <- function(file){
  df = read.csv(file)
  #Extract child name from file name and add variable.
  file_name = strsplit(file_path_sans_ext(file), "/")[[1]]
  name = file_name[(length(file_name))]
  df = df %>%
    mutate(participant = name)
  return(df)
}

my_get_results <- function(result_dir){
  files = list.files(path=result_dir, pattern="*.csv", full.names=TRUE, recursive=FALSE)
  df.prod_results = files %>% map(my_get_transcript_results) %>% reduce(rbind)
  return(df.prod_results)
}

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

### PARTIALLY ANNOTATE RESULTS FOR RESPONSE TYPE ###
## This will annotate all obvious type 1 and 2 responses, which represent the majority of responses
## I then have to go in and manually annotate and check remaining responses for irregular type 1s and type 2s, and type 3 and 4 responses.

result_dir = "../../data/01a_experiment/results/"
df.condition1 = my_get_prod_results(result_dir)


#Find cases to reject 
df.fillers <- df.condition1 %>% filter(condition %in% c("filler", "training")) %>% 
  select(participant, response1, response2, root, context)


#exclusions_experiment1 = c("28cond-trials", "10cond-trials", "12cond-trials", "14cond-trials", "19cond-trials", "9cond-trials") 
exclusions_experiment1a = c("11cond-trials", "14cond-trials", "28cond-trials") 

exclusions = exclusions_experiment1a

`%notin%` <- Negate(`%in%`)
df.condition1_selected <- df.condition1 %>% filter(participant %notin% exclusions)

summary(df.condition1_selected)

write.table(df.condition1_selected, file="condition1a_selected.csv", sep="\t", row.names =FALSE)

df.condition1_eval = read.csv(file="condition1a_selected.csv", sep ="\t")

df.condition1_partial_annot <- df.condition1_eval %>% group_by(category) %>% split( .$category) %>% 
  map(~ annotate_response_types(data = .)) %>% reduce(rbind) %>% 
  mutate(response1_type = unlist(response1_type), response2_type = unlist(response2_type)) 



final <- df.condition1_partial_annot %>% select(response1_type, response1, response2_type, response2, root, context, everything())

#write.table(final, file="condition1a_selected_partialannot.csv", sep="\t", row.names =FALSE)
