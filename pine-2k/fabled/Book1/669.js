save("save/bookmark", "Book1/669.js");

const MARK = 0;
const GOTO = 1;
const text = [
MARK,
`

  You are recognised by an
official, and a few moments later,
you are summoned to see the
general himself! You are taken to
the throne room, which has been
converted to a military style
headquarters. If you have the
codeword Assist,`,
GOTO,
"Book1/102.js",
`go to 102`,
`
immediately. If not, read on.

  Grieve Marlock is a tall,
hook-nosed man, with cold,
penetrating green eyes.

  'You come highly recommended by
my brother, the governor of
Yellowport - I was hoping you
would turn up,' he says in a`,
MARK,
`commanding voice. 'You did me a
great service by getting rid of
that pompous fool, Nergan.

  'Now there is one more thing I
need you for. The Citadel of Velis
Corin, which sits astride the Pass
of Eagles in the far north, is
under imminent attack from an army
of the steppes. The attackers are
a rag-tag bunch of malcontents -
nomads, Mannekyn People, some trau
even, and of course, the usual
traitorous dogs still loyal to the
old king - may his soul burn in
the hells, ha, ha, ha!'

  'I need you to go to the citadel,
discuss the situation with
Commandant Orin Telana, and do all`,
MARK,
`you can to make sure that the
citadel doesn't fall. I'm relying
on you!'

  Record the codeword Assist .

  If you have a * coded missive * ,`,
GOTO,
"Book1/677.js",
`
go to 677`,
`immediately. If not, you
are escorted out.`,
GOTO,
"Book1/100.js",
`go to 100`,
`.`,
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
