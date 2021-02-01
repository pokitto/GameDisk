save("save/bookmark", "Book1/9.js");

const MARK = 0;
const GOTO = 1;
const text = [
MARK,
`

  If you have the codeword
Altitude,`,
GOTO,
"Book1/272.js",
`go to 272`,
`immediately.
If not, read on.

  A notice has been pinned up in
the foyer. 'Adventurer priest
wanted. See the Chief
Administrator.'

  Naturally, you present yourself,
and the Chief Administrator, a
grey-whiskered priest of Elnir,
takes you into his office. He
shows you a special crystal ball
that displays an aerial view of
Marlock City. You notice several
strange-looking clouds hanging
over the city. They are shaped`,
MARK,
`like gigantic demons reaching down
to claw at the city laid out below
them.

  'The crystal ball shows things as
they are in the spirit world,'
explains the priest. 'These storm
demons cannot be seen under normal
circumstances, but they are there,
almost ready to destroy the city.'

  He goes on to tell you that Sul
Veneris, the divine Lord of
Thunder is one of the sons of
Elnir, the Sky God, chief among
the gods. He is responsible for
keeping the storm demons under
control, and thunder is thought to
be the sound of Sul Veneris
smiting the demons in his wrath.`,
MARK,
`
  'Unfortunately, the storm demons
have found a way to put Sul
Veneris into an enchanted sleep.
He lies at the very top of Devil's
Peak, a single spire of volcanic
rock, reaching up into the clouds.
The peak lies north of Marlock
City and the Curstmoor. We need an
enterprising priest to get to the
top of the peak and free Sul
Veneris from his sleep. But I must
warn you that several priests have
already tried, and we never saw
them again.'

  If you take up the quest, record
the codeword Altitude .`,
GOTO,
"Book1/100.js",
`go to 100`,
`
.`,
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
