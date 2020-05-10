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

  ]

  var items =  [
    {condition: "condition 1", item: "nonce", category: "noun",context: "My favorite animal is the XXX. They are impressive creatures. I saw a group of YYY during our trip last summer and I was so excited.", root: "bem", prompt: "My favorite animal is the bem. They are impressive creatures. I saw a group of [BLANK1] during our trip last summer and I was so excited."},
    {condition: "condition 2", item: "nonce", category: "adjective", context: "My mom's food always tastes XXX. She learnt to cook XXX food from her mom. I think she makes the YYY food in the world. Or at least, YYY food than my dad does.", root:"bem", prompt: "My mom's food always tastes bem. She learnt to cook bem food from her mom. I think she makes the [BLANK 1] food in the world. Or at least, [BLANK 2] food than my dad does."},
    {condition:"condition 1", item: "real", category:"noun",context:"My favorite animal is the XXX. They are impressive creatures. I saw a group of YYY during our trip last summer and I was so excited.", root:"lion", prompt:"My favorite animal is the lion. They are impressive creatures. I saw a group of [BLANK1] during our trip last summer and I was so excited."},
    {condition:"condition 2", item: "real", category:"adjective", context: "My mom's food always tastes XXX. She learnt to cook XXX food from her mom. I think she makes the YYY food in the world. Or at least, YYY food than my dad does.", root: "tasty", prompt: "My mom's food always tastes tasty. She learnt to cook tasty food from her mom. I think she makes the [BLANK 1] food in the world. Or at least, [BLANK 2] food than my dad does."}
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
