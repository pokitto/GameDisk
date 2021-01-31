save("save/bookmark", "Book1/656.js");

const MARK = 0;
const GOTO = 1;
const text = [
MARK,
`

  You find a large, red pavilion
which has been erected over a
ruin. Oliphard the Wizardly is
inside. He greets you warmly. If
you have a * magic chest * ,`,
GOTO,
"Book1/672.js",
`go to
672`,
`. If not, read on.

  If you have a * verdigris key * ,`,
GOTO,
"Book1/431.js",
`
go to 431`,
`. If not, read on.

  Oliphard can use his sorcery to
teleport you instantly to certain
places at a cost of 100 Shards a
journey. If you want to be
teleported, cross off the money
and choose from the following
destinations:
  `,
GOTO,
"Book1/100.js",
`Marlock City`,
MARK,
`  `,
GOTO,
"Book1/400.js",
`Caran Baru`,
`
  `,
GOTO,
"Book2/217.js",
`Wishport`,
`
  `,
GOTO,
"Book3/100.js",
`Dweomer`,
`

  Otherwise you can travel more
conventionally.
  `,
GOTO,
"Book1/602.js",
`Take the road to the Shadar Tor`,
`
  `,
GOTO,
"Book1/377.js",
`Take the road to Marlock City`,
`
  `,
GOTO,
"Book1/175.js",
`Head into the Curstmoor`,
`
  `,
GOTO,
"Book1/558.js",
`Take the road north`,
`
  `,
GOTO,
"Book1/233.js",
`Take the road to Yellowport`,
MARK
];

const funcs = new Array(5);
funcs[MARK] = f_mark;
funcs[GOTO] = f_goto;

window(0, 0, 220, 176);
io("FILLER", 3, "TEXT", "5x7");
io("FORMAT", 0, 0);

var index, selection = 0;
var position = 1, mark = 0;
var isLastMark = false;



render();

function f_mark(){
    position = index + 1;
    mark = index;
}

function f_goto(trigger){
    var page = text[index + 1];
    var caption = text[index + 2];
    var selected = ((index - mark) == selection);
    if(selected) print("[");
    else print(" ");
    print(caption);
    if(selected) print("]");
    else print(" ");

    index += 2;

    if(trigger){
        position = -1;
        splash(0, 0, "splash.565");
        window(0, 166, 220, 176);
        io("CLEARTEXT");
        cursor(1, 21);
        print(caption);
        exec(page);
    }
}

function isText(i){
    var line = text[i];
    return line < 0 || line >= length(funcs);
}

function render(){
    if(position < 0)
        return;
    io("CLEARTEXT");
    fill(0);
    cursor(0,0);
    color(32);
    index = position;
    for(; text[index] != MARK; ++index){
        var line = text[index];
        if(isText(index)) print(line);
        else funcs[line](false);
    }
    isLastMark = index == length(text) - 1;
    color(7);
}

function update(){
    if(justPressed("C"))
        exit();

    if(justPressed("A")){
        index = mark + selection;
        funcs[text[index]](true);
        render();
    }

    if(!isLastMark){
        flip(true);
        sprite(220-8, 176-8, builtin("cursor2"));
    }

    var direction = justPressed("DOWN") - justPressed("UP");
    if(direction == 0){
        return;
    }
    var prevPrev = 0;
    var prevMark = 0;
    var prevSelection = -1;
    var curSelection = -1;
    var absSelection = mark + selection + (direction > 0);
    index = (mark + selection) * (direction > 0);
    for( ; (prevSelection != absSelection) && (isText(curSelection) || curSelection < absSelection); ++index){
        if(index >= length(text)) return;
        if(isText(index)) continue;
        prevSelection = curSelection;
        curSelection = index;
        var line = text[index];
        if(line != MARK){
            funcs[line](false);
        } else {
            prevPrev = prevMark;
            prevMark = index;
        }
    }

    if(direction > 0){
        index = curSelection;
    }else{
        if(prevSelection < mark){
            if(mark == 0)
                return;
            index = prevPrev;
            funcs[MARK](false);
        }
        index = prevSelection;
    }

    if(text[index] == MARK){
        if(isLastMark && direction > 0){
            render();
            return;
        }
        selection = 0;
    }else
        selection = index - mark;

    funcs[text[index]](false);

    render();
}
