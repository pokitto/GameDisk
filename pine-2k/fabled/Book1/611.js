save("save/bookmark", "Book1/611.js");

const MARK = 0;
const GOTO = 1;
const text = [
MARK,
`

  If you have the codeword Anvil,`,
GOTO,
"Book1/130.js",
`
go to 130`,
`immediately. If not, read
on.

  As you draw nearer, you see that
the pennants all represent
different coloured dragons - the
red dragon, black dragon, green
dragon and so on. Outside the
gates, a jousting list has been
set up, and a few warriors are
trying their hand against some
knights who have dragon symbols on
their shields.

  A knight, in full plate armour,
rides up and says, 'Welcome to the
Castle of the Dragon Knights. It`,
MARK,
`is our custom to joust against all
who would come here - for a wager,
of course.'

  He explains that you must bet the
weapon and the suit of armour that
you will use for the joust. If you
lose, you forfeit the weapon and
armour. If you win, you get the
armour and weapon of the knight
you defeat. Most of your potential
opponents, you note, would be
using a sword and plate armour.

  If you have the codeword Axe,`,
GOTO,
"Book1/521.js",
`go
to 521`,
`immediately. Otherwise, you
can leave,`,
GOTO,
"Book1/276.js",
`go to 276`,
`, or take the
wager and joust,`,
GOTO,
"Book1/297.js",
`go to 297`,
`- you
must have a weapon and at least
leather armour.`,
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
