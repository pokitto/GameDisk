save("save/bookmark", "Book1/596.js");

const MARK = 0;
const GOTO = 1;
const text = [
MARK,
`

  You thread your way through the
ranks of trees. In places, the
forest canopy almost blocks out
the sunlight completely, and you
are wandering in deep shadow,
haunted by the cries of the
creatures of the forest. If you
have an * oak staff * ,`,
GOTO,
"Book1/653.js",
`go to 653`,
`
immediately. If not, read on.

  You hack your way through the
undergrowth until you stumble
across an old ruin. Creepers, and
forest moss have grown over most
of it, but you can see mask-like
faces set into the walls, glaring
down at you as if in angry outrage
at your intrusion. You come to a`,
MARK,
`massive stone slab - clearly a
door. Set into the middle of it is
a round, granite face, the visage
of a sleeping demon. Suddenly, an
eye pops open, and regards you
curiously.

  'By the Tentacles of Tantallon!'
exclaims the face in a gravelly
voice. 'A human! I haven't seen
one of you lot for a hundred
years.' An expression of suspicion
forms on its rocky features. 'What
do you want, anyway?'

  'Just passing through,' you
comment airily.

  'Well you can't pass through me
unless you know the password. And`,
MARK,
`that was given to me by Astrallus
the Wizard King, umm... let me
see, now... a thousand years ago,
by Ebron! This is his tomb, you
know.'

  If you have the codeword Crag,`,
GOTO,
"Book1/160.js",
`go
to 160`,
`. Otherwise, read on.

  'How do I find the password
then?' you ask.

  'Well,' says the demon door,
'Astrallus was a wizard, so why
don't you ask some wizards?'

  'Where would I find some
wizards?' you ask.

  'How would I know?' replies the`,
MARK,
`door testily. 'I've been stuck
here for a thousand years!'

  You decide it is time to leave.
  `,
GOTO,
"Book1/110.js",
`North to the Bronze Hills`,
`
  `,
GOTO,
"Book1/333.js",
`West to the River Grimm`,
`
  `,
GOTO,
"Book1/560.js",
`South into the country`,
`
  `,
GOTO,
"Book1/387.js",
`East to the road`,
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
