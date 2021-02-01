save("save/bookmark", "Book1/122.js");

const MARK = 0;
const GOTO = 1;
const text = [
MARK,
`

  If you have the codeword Acid,`,
GOTO,
"Book1/543.js",
`go
to 543`,
`immediately. If not, but
you have a * copper amulet * ,`,
GOTO,
"Book1/384.js",
`go
to 384`,
`immediately. Otherwise,
read on.

  Guildmaster Vernon of Yellowport
is surprisingly eager to see you.
He is a hugely fat and bejewelled
merchant, and he tells you that a
group of ratmen have made a base
in the sewers beneath the city.
They come out at night to raid the
warehouses and homes of the
merchants of Yellowport.

  'We need an adventurer like
yourself to destroy their king,'`,
MARK,
`explains the guildmaster. 'Without
him, the ratmen wouldn't be able
to organize a feast in a larder.
We will pay you 450 Shards if you
succeed.'

  Vernon tells you that the sewers
can be entered via an old disused
well in the poor quarter.

  Whenever you are ready to enter
the sewers, and you are in
Yellowport, turn to * 460 * .`,
GOTO,
"Book1/460.js",
`Note
this option`,
`on your Adventure
Sheet. Now you can return to the
city centre,`,
GOTO,
"Book1/10.js",
`go to 10`,
`, or`,
GOTO,
"Book1/460.js",
`go down
the sewers straight away`,
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
