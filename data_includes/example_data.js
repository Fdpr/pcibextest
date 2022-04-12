PennController.DebugOff();

var Parameters = {},
    URLParameters = window.location.search.replace("?", "").split("&");

for (parameter in URLParameters) Parameters[URLParameters[parameter].split("=")[0]] = URLParameters[parameter].split("=")[1];


var shuffleSequence = seq("ID", "instruction", "practice", rshuffle("test"), "postExp");


if (Parameters.hasOwnProperty("Home")) shuffleSequence = seq("home");


//var practiceItemTypes = ["practice"];
var showProgressBar = true;
var progressBarText = "Fortschritt"; // aendert die Beschriftung des Fortschrittbalkens
//var manualSendResults = true;
var practiceItemTypes = ["practice"];

var defaults = [
    "DynamicQuestion", {
        answers: {},
        scale: "<div><p id='scale' style='margin: 2em; text-align: center;'>V&ouml;llig unnat&uuml;rlich "+
               "<input type='radio' name='nat' value='0' /> "+
               "<input type='radio' name='nat' value='1' /> "+
               "<input type='radio' name='nat' value='2' /> "+
               "<input type='radio' name='nat' value='3' /> "+
               "<input type='radio' name='nat' value='4' /> "+
               "<input type='radio' name='nat' value='5' /> "+
               "<input type='radio' name='nat' value='6' /> "+
               " V&ouml;llig nat&uuml;rlich</p>"+
               "<p style='text-align: center;'><a class='DynamicQuestion-fake-link' id='click'>Hier klicken um fortzusetzen</a></p></div>"
    },
    "Form", {
        hideProgressBar: true,
        continueOnReturn: true,
        saveReactionTime: true
    }
];

/*function get_sentence(sentence){
    return $("<p id='sentence' style='font-family: Sans serif; font-size: 1.6em; margin-bottom: 30px;'>"+sentence+".</p>");
}

function get_context(context){
    return $("<p>").append($("<p id='context' style='font-style: Sans serif; font-size: 1.5em;'>"+context+".</p>"));
    //.append($("<p style='font-family: Sans serif; font-style: italic; font-size: 1.3em; margin-bottom: 20px;'>This leads me to conclude</p>"))
}*/


function get_sentence(context, test){
    if (!context.match(/\.$/)) context += '.';
    if (!test.match(/\.$/)) test += '.';
    while (context.match(/(\s+\.|\.\.+)$/))                // Using a while because e.g. "sentence. " becomes "sentence. ." (see 'if' on context right above)
        context = context.replace(/\s*\.+$/,'.');   // and applying replace only once would then output "sentence.." (Florian's remark re item 10 on Slack)
    while (test.match(/(\s+\.|\.\.+)$/))
        test = test.replace(/\s*\.+$/,'.');
    return $("<p id='sentence' style='font-family: Sans serif; font-size: 1.6em; margin-bottom: 30px;'><span id='context'>"+context+"</span> "+
             "<span id='test'>"+test+"</span></p>");
}


function send_answer(answer, t){
    t.finishedCallback([[
                         ["Question", t.question],
                         ["Answer", answer],
                         ["Time", Date.now()-t.creationTime]
                      ]]);
}

function clickButton(callback) {
    var clicked = false;
    return function(t){ 
             $("#click").bind("click", function(){
                 if (clicked) return;
                 var checked = false;
                 $("input").each(function(){
                     if ($(this).is(":checked")){
                         callback($(this).attr("value"), t);
                         checked = true;
                     }    
                 });
                 if (!checked) alert("Sie müssen eine der Optionen auswählen");
                 else clicked = true;
             });
           };
}


var items = [

    /*["home", "Message", {
        html: "<div style='text-align:center;'>"+
              "<p style='font-weight:bold;'>Please select which version of the experiment you want to access.</p>"+
              "<table style='margin: auto;'>"+
              "<tr><td><a href='http://spellout.net/ibexexps/SchwarzLabArchive/IncrSymExp2/server.py?withsquare=0000'>Group 1</a></td>"+
              "    <td><a href='http://spellout.net/ibexexps/SchwarzLabArchive/IncrSymExp2/server.py?withsquare=0002'>Group 3</a></td></tr>"+
              "<tr><td><a href='http://spellout.net/ibexexps/SchwarzLabArchive/IncrSymExp2/server.py?withsquare=0001'>Group 2</a></td>"+
              "    <td><a href='http://spellout.net/ibexexps/SchwarzLabArchive/IncrSymExp2/server.py?withsquare=0003'>Group 4</a></td></tr>"+
              "</table>"+
              "<p>Debug version (showing condition label):</p>"+
              "<table style='margin: auto;'>"+
              "<tr><td><a href='http://spellout.net/ibexexps/SchwarzLabArchive/IncrSymExp2/server.py?withsquare=0000&Debug=T'>Group 1</a></td>"+
              "    <td><a href='http://spellout.net/ibexexps/SchwarzLabArchive/IncrSymExp2/server.py?withsquare=0002&Debug=T'>Group 3</a></td></tr>"+
              "<tr><td><a href='http://spellout.net/ibexexps/SchwarzLabArchive/IncrSymExp2/server.py?withsquare=0001&Debug=T'>Group 2</a></td>"+
              "    <td><a href='http://spellout.net/ibexexps/SchwarzLabArchive/IncrSymExp2/server.py?withsquare=0003&Debug=T'>Group 4</a></td></tr>"+
              "</table>"+
              "(You can enter whatever as a Prolific ID on the first page)"+
              "</div>",
        transfer: null
    }],*/

    //["instruction", "__SetCounter__", {}],
    
    //["instruction", "Form", {html: {include: "ProlificConsentForm.html"}}],

    ["ID", "Form", {html: {include: "IDp.html"}, continueOnReturn: true, continueMessage: "Klicken um fortzusetzen"}],

    //["final", "Form", {html: {include: "final.html"}, continueOnReturn: false}],

    // ["Info", "Form", {html: {include: "Info.html"}, continueOnReturn: true, continueMessage: "Klicken um fortzusetzen"}],
    
    ["instruction", "DynamicQuestion", {
        legend: "instruction",
        //context: get_context("A horse walks into a bar"),
        sentence: get_sentence("Kommt ein Pferd in die Bar.", "Der Barkeeper fragt: 'Warum so ein langes Gesicht?'"),
        enabled: false,
        sequence: [
            TT("#bod", "In diesem Experiment werden Ihnen kurze Ausschnitte von fiktiven Redebeitr&auml;gen pr&auml;sentiert.", "Leertaste dr&uuml;cken", "mc"),
            {pause: "key\x01"},            
            {this: "sentence"},
            TT("#sentence", "Sie sollen einsch&auml;tzen, wie nat&uuml;rlich diese Redebeitr&auml;ge sind.", "Leertaste dr&uuml;cken", "bc"),
            {pause: "key\x01"},
            TT("#bod", "Zuerst werden wir ein wenig &uuml;ben, damit die Aufgabe nachvollziehbar wird.", "Leertaste dr&uuml;cken", "mc"),
            {pause: "key\x01"},
            function(t){ t.finishedCallback(); }
        ]
    }],
    
    ["practice", "DynamicQuestion", {
        legend: "practice1",
        //context: get_context("Natalie is from the USA"),
        sentence: get_sentence("Jeanette spielt oft Brettspiele und ich weiß, dass sie besonders gern Monopoly spielt.", "Wenn sie das Spiel irgendwann langweilt, werde ich ihr vorschlagen, dass wir Risiko spielen."),
        enabled: false,
        sequence: [
            {pause: 300},
            {this: "sentence"},
            {pause: 300},
            TT("#sentence", "Stellen Sie sich vor, jemand macht diese Aussage.", "Leertaste dr&uuml;cken", "bc"),
            {pause: "key\x01"},
            TT("#sentence", "An dieser Aussage ist nichts komisch...", "Leertaste dr&uuml;cken", "bc"),
            {pause: "key\x01"},
            TT("#sentence", "... zuerst wird erz&auml;hlt, dass Jeanette oft Brettspiele spielt und weiter, dass sie besonders gern Monopoly spielt. Dann sagt die Sprecherin, dass sie Jeanette vorschlagen wird, Risiko zu spielen, wenn sie etwas Neues ausprobieren m&ouml;chte.", "Leertaste dr&uuml;cken", "bc"),
            {pause: "key\x01"},
            {this: "scale"},
            clickButton(
                function(answer, t) { 
                    t.response = answer;
                    if (answer < 3) TT("#click", "Im Gegenteil: ein Wert auf der rechten Seite scheint angemessen.", "Leertaste dr&uuml;cken", "bc")(t);
                    else TT("#click", "Genau: ein Wert auf der rechten Seite scheint angemessen.", "Leertaste dr&uuml;cken", "bc")(t);
                }
            ),
            function(t){ $("#click, #scale input").attr("disabled", true); },
            TT("#scale", "Geben Sie an dieser Skala an, wie nat&uuml;rlich diese Aussage klingt.", "Leertaste dr&uuml;cken", "bc"),
            {pause: "key\x01"},
            TT("#sentence", "In diesem Fall würden Sie angeben, dass die Aussage nat&uuml;rlich klingt (d.h., Werte auf der rechten Seite).", "Leertaste dr&uuml;cken und Skala anklicken.", "bc"),
            {pause: "key\x01"},
            function(t) { 
                var clicked = false;
                $("#scale input").click(function(){ 
                    if (clicked) return;
                    TT("#click", "Klicken Sie hier um fortzufahren.", "Leertaste dr&uuml;cken", "bc")(t);
                    clicked = true;
                }); 
                $("#click, #scale input").removeAttr("disabled");
            },
            {pause: "key\x01"},
            {pause: "key\x01"},
            function(t){ send_answer(t.response, t); }
        ]
    }],
    
    ["practice", "DynamicQuestion", {
        legend: "practice2",
        //sentence: get_sentence("Ryan has two children.", "His third is already in second grade"),
        sentence: get_sentence("Jonas w&uuml;nscht sich lange ein Kind und ich wei&szlig;, dass seine Freundin schwanger ist.", "Wenn sie schwanger ist, werde ich ihnen ein Buch mit Kinderliedern kaufen."),
        enabled: false,
        sequence: [
            {pause: 300},
            {this: "sentence"},
            {this: "scale"},
            function(t){ $("#click, #scale input").attr("disabled", true); },
            {pause: 500},
            //TT("#sentence", "Here, Ryan is only said to have two children first, but then a reference is made to his third child.", "Press Space", "bc"),
            TT("#sentence", "Sehen wir uns nun eine zweite Aussage an.", "Leertaste dr&uuml;cken", "bc"),
            {pause: "key\x01"},
            TT("#sentence", "In diesem Fall, wird zuerst gesagt, dass Jonas sich ein Kind w&uuml;nscht. Die sprechende Person scheint zu wissen, dass seine Freundin schwanger ist, stellt dies dann aber gleich in Frage.", "Leertaste dr&uuml;cken", "bc"),
            {pause: "key\x01"},
            TT("#sentence", "An dieser Aussage ist etwas komisch: Man w&uuml;rde erwarten, dass jemand, der meint etwas zu wissen, dies nicht sofort in Frage stellt.", "Leertaste dr&uuml;cken", "bc"),
            {pause: "key\x01"},
            TT("#scale", "In diesem Fall w&uuml;rden Sie angeben, dass die Aussage UNnat&uuml;rlich klingt (d.h., Werte auf der linken Seite).", "Leertaste dr&uuml;cken und Skala anklicken", "bc"),
            {pause: "key\x01"},
            function(t){ $("#click, #scale input").removeAttr("disabled"); },
            clickButton(
                function(answer, tbis) {
                    tbis.response = answer;
                    if (answer > 3) TT("#click", "Im Gegenteil: ein Wert auf der linken Seite scheint angemessen.", "Leertaste dr&uuml;cken", "bc")(tbis);
                    else TT("#click", "Genau: ein Wert auf der linken Seite scheint angemessen.", "Leertaste dr&uuml;cken", "bc")(tbis);
                }
            ),
            {pause: "key\x01"},
            function(t){ send_answer(t.response, t); }
        ]
    }],

    /*["practice", "DynamicQuestion", {
        legend: "practice3",
        sentence: get_sentence("Ryan has two children", "His third is already in second grade"),
        //inference: get_context("Ryan studied economics"),
        answers: {CU: "Completely unnatural", QU: "Quite unnatural", SU: "Unnatural-ish",
                  N: "So-so", SN: "Natural-ish", QN: "Quite natural", CN: "Completely natural"},
        enabled: true,
        sequence: [
            {pause: 300},
            {this: "sentence"},
            //{this: "scale"},
            {pause: 300},
            {this: "answers"}
        ]
    }], */   
        
    
   ["practice", "Message", {html: "Gut. Wir k&ouml;nnen jetzt mit dem eigentlichen Experiment anfangen, in dem Sie eine Reihe solcher Aussagen beurteilen sollen. Dr&uuml;cken Sie eine Taste, um fortzufahren.", transfer: "keypress"}],
    
   
   ["postExp", "Form", {html: {include:"ProlificFeedbackPreConfirmation.html"}}],
    
   ["postExp", "__SendResults__", {}],
   
   ["postExp", "Message", {html: {include: "ProlificConfirmation.html"}, transfer: null}]
   

    ].concat(
      GetItemsFrom(data, null,
        {
          ItemGroup: ["item", "group"],
          Elements: [
                      "test",                       // Label of the item
                      "DynamicQuestion",            // Controller
                      {
                        legend: function(x){ return [x.item,x.group,x.bedingung,x.type,x.condition,x.ContextType,x.trigger,x.Context.replace(',',''),x.sentence.replace(',','')].join("+"); },
                        sentence: function(x){ return get_sentence(x.Context,x.sentence); },
                        //inference: function(x){ return get_context(x.inference); },
                        sequence:function(x){
                            var debug = "";
                            if (Parameters.hasOwnProperty("Debug")) 
                                debug = "Item: "+x.item+"; Group: "+x.group+"; Context: "+x.ContextType+"; Order: "+x.internal_order+"; Type: "+x.type+"; Condition: "+x.condition;
                            return [
                              debug,
                              {pause: 250},
                              {this: "sentence"},
                              //{this: "inference"},
                              {this: "scale"},
                              clickButton(send_answer)
                            ];
                        }
                      }
                    ]
        }        
      )
);
