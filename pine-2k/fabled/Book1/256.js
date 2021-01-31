save("save/bookmark", "Book1/256.js");

const MARK = 0;
const GOTO = 1;
const text = [
MARK,
`

  The king is overjoyed with the
news. 'Excellent! At this rate I
will be able to take my rightful
place in the throne room of Old
Sokar.'

  He rewards you with the title .
Note this in the Titles and
Honours box on your Adventure
Sheet. The title comes with a cash
gift of as well.

  You also go up one Rank . Roll
one die - the result is the number
of Stamina points you gain
permanently. Note the increase on
your Adventure Sheet. Also, don't
forget to increase your Defence by`,
MARK,
`1 as a result of your gain in
Rank.

  The king has another mission for
you. He explains that an army of
steppe Nomads, Trau, Mannekyn
people, and Sokaran troops still
loyal to Nergan, have gathered on
the steppes, and are moving to
siege the Citadel of Velis Corin,
which guards the Pass of Eagles
through the Spine of Harkun.
Nergan tells you that an alliance
of northern nations has declared
war on the new Sokaran regime. A
certain General Beladai leads the
Northern Alliance, and King Nergan
has joined forces with him. He
asks you to travel to the Steppes
and talk to General Beladai.`,
MARK,
`
  'An adventurer like yourself
might be able to steal into the
citadel, and bring about its
downfall from within, or some
such. If the citadel falls we will
have Sokara at our mercy.'

  If you want to take up this
mission for the King, record the
codeword Assault . When you are
ready, you are led back down to
the foothills of the mountains.`,
GOTO,
"Book1/474.js",
`go
to 474`,
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
