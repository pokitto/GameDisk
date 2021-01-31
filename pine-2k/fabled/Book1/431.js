save("save/bookmark", "Book1/431.js");

const MARK = 0;
const GOTO = 1;
const text = [
MARK,
`

  You notice that Oliphard has
erected his pavillion over a
verdigris trapdoor set into the
floor.

  'Ah, you have the key, I see!'
says Oliphard. 'Please, be my
guest - use the door.'

  You open it up and climb some
short stairs into a square chamber
with three doors.

  'They are doors of teleportation
- step through and you will be
taken to whatever land is
displayed!' says Oliphard.
`,
MARK,
`  The first door leads to a teeming
city of merchants - Metriciens in
Golnir.`,
GOTO,
"Book2/48.js",
`Turn to paragraph 48 in
Cities of Gold and Glory`,
`if you
enter this door.

  The second door leads to a huge
mountain - Sky Mountain in the
Great Steppes, far to the north.`,
GOTO,
"Book4/185.js",
`
Turn to paragraph 185 in The Plains
of Howling Darkness`,
`if you enter
this door.

  The third door leads to Dweomer,
the City of Sorcerers, on
Sorcerers' Isle.`,
GOTO,
"Book3/100.js",
`Turn to paragraph
100 in Over the Blood-Dark Sea`,
`if
you open this door.

  If you don't want to step through`,
MARK,
`any of the doors,`,
GOTO,
"Book1/656.js",
`go to 656`,
`and
choose again.`,
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
