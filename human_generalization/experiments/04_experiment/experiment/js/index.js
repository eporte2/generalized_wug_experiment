function make_slides(f) {
  var   slides = {};

  slides.i0 = slide({
     name : "i0",
     start: function() {
      exp.startT = Date.now();
     }
  });

  slides.introduction = slide({
    name : "introduction",
    button : function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.training_instructions = slide({
    name : "training_instructions",
    button : function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

//training test sentences
  slides.training = slide({
    name: "training",
    present: exp.training_stims,

    present_handle :function(stim) {
      $(".err").hide();
      this.stim = stim;
      $(".prompt").html(this.stim.prompt);

      $('input[id="text_response"]').prop("value", "")
    },

    button : function() {
      exp.response = $("#text_response").val();
      if (exp.response.length == 0) {
        $(".err").show();
      } else {
        this.log_responses();

      /* use _stream.apply(this); if and only if there is
      "present" data. (and only *after* responses are logged) */
      _stream.apply(this);
      }
    },

    log_responses : function() {
      exp.data_trials.push({
        "slide_number" : exp.phase,
        "condition" : this.stim.condition,
        "item" : this.stim.item,
        "category" : this.stim.category,
        "context" : this.stim.context,
        "root" : this.stim.root,
        "prompt" : this.stim.prompt,
        "response1" : exp.response,
        "response2" : "NA",
      });
    }
  });


  slides.instructions = slide({
    name : "instructions",
    button : function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  // Version with two text boxes
    slides.generation = slide({
      present: exp.stims, //every element in exp.stims is passed to present_handle one by one as 'stim'

      present_handle :function(stim) {
        $(".err").hide();

        this.stim = stim;
        if (this.stim.category != "noun"){
          $('input[id="text_response2"]').prop("hidden", false);
        } else {
          $('input[id="text_response2"]').prop("hidden", true);
        }

        $(".prompt").html(this.stim.prompt);

        $('input[id="text_response1"]').prop("value", "");
        $('input[id="text_response2"]').prop("value", "");
      },
      name: "generation",

      button : function() {
        if (this.stim.category != "noun"){
          exp.response1 = $("#text_response1").val();
          exp.response2 = $("#text_response2").val();
        } else {
          exp.response1 = $("#text_response1").val();
          exp.response2 = "NA"
        }
        if (exp.response1.length == 0 || exp.response2.length == 0 ) {
          $(".err").show();
        } else {
          this.log_responses();

        /* use _stream.apply(this); if and only if there is
        "present" data. (and only *after* responses are logged) */
        _stream.apply(this);
        }
      },

      log_responses : function() {
        exp.data_trials.push({
          "slide_number" : exp.phase,
          "condition" : this.stim.condition,
          "item" : this.stim.item,
          "category" : this.stim.category,
          "context" : this.stim.context,
          "root" : this.stim.root,
          "prompt" : this.stim.prompt,
          "response1" : exp.response1,
          "response2" : exp.response2
        });
      }
    });

  slides.subj_info =  slide({
    name : "subj_info",
    submit : function(e){
      //if (e.preventDefault) e.preventDefault(); // I don't know what this means.
      exp.subj_data = {
        language : $("#language").val(),
        enjoyment : $("#enjoyment").val(),
        asses : $('input[name="assess"]:checked').val(),
        age : $("#age").val(),
        gender : $("#gender").val(),
        education : $("#education").val(),
        comments : $("#comments").val(),
        problems: $("#problems").val(),
        fairprice: $("#fairprice").val()
      };
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.thanks = slide({
    name : "thanks",
    start : function() {
      exp.data= {
          "trials" : exp.data_trials,
          "catch_trials" : exp.catch_trials,
          "system" : exp.system,
          "condition" : exp.condition,
          "subject_information" : exp.subj_data,
          "time_in_minutes" : (Date.now() - exp.startT)/60000
      };
      setTimeout(function() {turk.submit(exp.data);}, 1000);
    }
  });

  return slides;
}

/// init ///
function init() {
  exp.trials = [];
  exp.catch_trials = [];

  exp.condition = _.sample(["condition 1", "condition 2"]); //can randomize between subject conditions here
  console.log(exp.condition);

  exp.training_stims = [
      {condition:"training", item: "real", category:"noun",context:"This is a XXX. They are really enjoyable. This one is one of my sister's YYY.", root:"bear", prompt:"This is a bear. They are really enjoyable. This one is one of my sister's bear[BLANK1]."},
      {condition:"training", item: "real", category:"verb",context:"I would love to learn how to XXX. My friend has been YYY recently and loves it.", root:"knit", prompt:"I would love to learn how to knit. My friend has been knit[BLANK1] recently and loves it."},
      {condition:"training", item: "real", category:"verb",context:"John said he wants to XXX. Yesterday, his partner YYY and John decided he wanted to try.", root:"cook", prompt:"John said he wants to cook. Yesterday, partner cook[BLANK1] and John decided he wanted to try."},
      {condition:"training", item: "real", category:"adjective",context:"Such a XXX child! She really is the YYY child I've ever seen.", root:"sweet", prompt:"Such a sweet child! She really is the sweet[BLANK1] child I've ever seen."},
      {condition:"training", item: "real", category:"adjective",context:"This was a XXX problem. It was definitely YYY than other problems they had encountered.", root:"hard", prompt:"This was a hard problem. It was definitely hard[BLANK1] than other problems they had encountered."}
    ];

  var items =  [
    {condition: "filler", item: "real", category: "verb", context: "Everyone wants to XXX. Magazines are telling me to XXX. It seems like YYY is cool. But I YYY last week, and I don't see what all the fuss is about.", root: "jog", prompt: "Everyone wants to jog. Magazines are telling me to jog. It seems like jog[BLANK1] is cool. But I jog[BLANK2] last week, and I don't see what all the fuss is about."},
    {condition: "filler", item: "real", category: "verb", context: "Nobody wants to XXX these days. I don't know why people don't XXX. This country has a long tradition of YYY. Years ago everyone YYY and life was much better.", root: "farm", prompt: "Nobody wants to farm these days. I don't know why people don't farm. This country has a long tradition of farm[BLANK1]. Years ago everyone farm[BLANK2] and life was much better."},
    {condition: "filler", item: "real", category: "verb", context: "When I was a kid I used to XXX. My father taught me to XXX. I used to enjoy YYY very much. But I probably YYY one too many times.", root: "ski", prompt: "When I was a kid I used to ski. My father taught me to ski. I used to enjoy ski[BLANK1] very much. But I probably ski[BLANK2] one too many times."},
    {condition: "filler", item: "real", category: "verb", context: "Jim loves to XXX all the time. It seems he was born to XXX. YYY is what he's good at. Last week he YYY six days out of seven.", root: "paint", prompt: "Jim loves to paint all the time. It seems he was born to paint. Paint[BLANK1] is what he's good at. Last week he paint[BLANK2] six days out of seven."},
    {condition: "filler", item: "real", category: "noun", context: "I would like to have a XXX. They are great companions. I am envious of people who are fortunate enough to have more than one. If I could have many YYY, I would.", root: "pet", prompt: "I would like to have a pet. They are great companions. I am envious of people who are fortunate enough to have more than one. If I could have many pet[BLANK1], I would."},
    {condition: "filler", item: "real", category: "noun", context: "It is hard to believe that having a XXX is fine now. This would have been unacceptable in our day. We were always taught that YYY were bad.", root: "tattoo", prompt: "It is hard to believe that having a tattoo is fine now. This would have been unacceptable in our day. We were always taught that tattoo[BLANK1] were bad."},
    {condition: "filler", item: "real", category: "noun", context: "Did they ask about the XXX? I think we need to let them know by tomorrow. I hear YYY are in scarce quantity at the store.", root: "cake", prompt: "Did they ask about the cake? I think we need to let them know by tomorrow. I hear cake[BLANK1] are in scarce quantity at the store."},
    {condition: "filler", item: "real", category: "adjective", context: "I met a XXX person today. I don't think I've ever met anyone so XXX. They were definitely the YYY person I've met. They were even YYY than you.", root: "tall", prompt: "I met a tall person today. I don't think I've ever met anyone so tall. They were definitely the tall[BLANK1] person I've met. They were even tall[BLANK2] than you."},
    {condition: "filler", item: "real", category: "adjective", context: "XXX things are nice. Some people disagree, but quite a few think XXX things are great. Well, at least everyone can agree that the YYY one of all is nice. Nothing is YYY than this one.", root: "soft", prompt: "Soft things are nice. Some people disagree, but quite a few think soft things are great. Well, at least everyone can agree that the soft[BLANK1] one of all is nice. Nothing is soft[BLANK2] than this one."},
    {condition: "filler", item: "real", category: "adjective", context: "Why are XXX pants popular? Most find XXX pants uncomfortable. For some reason though, people still try to wear the YYY ones they can find, always looking for a YYY pair than the last.", root: "tight", prompt: "Why are tight pants popular? Most find tight pants uncomfortable. For some reason though, people still try to wear the tight[BLANK1] ones they can find, always looking for a tight[BLANK2] pair than the last."}
  ];

    exp.stims = _.shuffle(items);


  exp.system = {
      Browser : BrowserDetect.browser,
      OS : BrowserDetect.OS,
      screenH: screen.height,
      screenUH: exp.height,
      screenW: screen.width,
      screenUW: exp.width
    };
  //blocks of the experiment:
  exp.structure=["i0","introduction", "training_instructions", "training", "instructions", "generation", 'subj_info', 'thanks'];

  exp.data_trials = [];
  //make corresponding slides:
  exp.slides = make_slides(exp);

  exp.nQs = utils.get_exp_length(); //this does not work if there are stacks of stims (but does work for an experiment with this structure)
                    //relies on structure and slides being defined

  $('.slide').hide(); //hide everything

  //make sure turkers have accepted HIT (or you're not in mturk)
  $("#start_button").click(function() {
    if (turk.previewMode) {
      $("#mustaccept").show();
    } else {
      $("#start_button").click(function() {$("#mustaccept").show();});
      exp.go();
    }
  });

  exp.go(); //show first slide
}
