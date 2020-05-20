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
      $(".prompt1").html(this.stim.prompt1);
      $(".prompt2").html(this.stim.prompt2);

      $("#text_response").val("");
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
          $(".prompt1").html(this.stim.prompt1);
          $(".prompt2").html(this.stim.prompt2);
          $(".prompt3").html(this.stim.prompt3);
        } else {
          $('input[id="text_response2"]').prop("hidden", true);
          $(".prompt1").html(this.stim.prompt1);
          $(".prompt2").html(this.stim.prompt2);
          $(".prompt3").html("");
        }


        $('input[id="text_response1"]').prop("value", "");
        $('input[id="text_response2"]').prop("value", "");
      },
      name: "generation",

      button : function() {
        console.log("BUTTON");
        if (this.stim.category != "noun"){
          exp.response1 = $("#text_response1").val();
          exp.response2 = $("#text_response2").val();
        } else {
          exp.response1 = $("#text_response1").val();
          exp.response2 = "NA"
        }
        if (exp.response1.length == 0 || exp.response2.length == 0 ) {
          $(".err").show();
          console.log("ERROR");
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

  exp.condition = turkGetParam("condition");

  console.log(exp.condition);

  exp.training_stims = [
    {condition:"training", item: "real", category:"noun",context:"This is a XXX. They are really enjoyable. This one is one of my sister's YYY.", root:"bear", prompt1:"This is a bear. They are really enjoyable. This one is one of my sister's ", prompt2:" ."},
    {condition:"training", item: "real", category:"verb",context:"I would love to learn how to XXX. My friend has been YYY recently and loves it.", root:"knit", prompt1:"I would love to learn how to knit. My friend has been ", prompt2:" recently and loves it."},
    {condition:"training", item: "real", category:"verb",context:"John said he wants to XXX. His partner YYY yesterday, and now John has decided he wants to try.", root:"cook", prompt1:"John said he wants to cook. His partner ", prompt2:" yesterday, and now John has decided he wants to try."},
    {condition:"training", item: "real", category:"adjective",context:"Such a XXX child! She really is the YYY child I've ever seen.", root:"sweet", prompt1:"Such a sweet child! She really is the ", prompt2:" child I've ever seen."},
    {condition:"training", item: "real", category:"adjective",context:"This was a XXX problem. It was definitely YYY than other problems they had encountered.", root:"hard", prompt1:"This was a hard problem. It was definitely ", prompt2:" than other problems they had encountered."}
  ];

  var condition_items = [];
  for (var i = 0; i < items.length; i++){
    if (items[i]["condition"]==exp.condition || items[i]["condition"]== "filler"){
      condition_items.push(items[i]);
    }
  }

    exp.stims = _.shuffle(condition_items);


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
