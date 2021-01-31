save("save/bookmark", "Book1/20.js");

const MARK = 0;
const GOTO = 1;
const text = [
MARK,
`

  'Well, well, well, what have we
here, friends?' asks the old man.
He seems to be talking to someone
next to him, although you are
certain he is alone. 'Looks like a
washed up adventurer to me!' he
says in answer to his own
question, 'all wet and out of
luck.'

  He carries on having a
conversation - a conversation that
quickly turns into a heated
debate. He is clearly quite mad.

  'Excuse me, umm, EXCUSE ME!,' you
shout above the hubbub in an
attempt to grab the old man's`,
MARK,
`attention. He stops and stares at
you.

  'Is this the Isle of the Druids?'
you ask impatiently.

  'Indeed it is,' says the old man,
'I see that you are from a far
land, so it is up to me to welcome
you to Harkuna. But I think you
may have much to do here as it is
written in the stars that someone
like you would come. Your destiny
awaits you! Follow me, young
adventurer.'

  The old man turns smartly about
and begins walking up a path
towards some hills. You can just
see some sort of monolithic stone`,
MARK,
`structure atop one of them.

  'Come on, come on, I'll show you
the Gates of the World,' the old
man babbles.
  `,
GOTO,
"Book1/192.js",
`Follow him`,
`
  `,
GOTO,
"Book1/128.js",
`Explore the coast`,
`
  `,
GOTO,
"Book1/257.js",
`Head into the nearby forest`,
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
