save("save/bookmark", "Book1/1.js");

const MARK = 0;
const GOTO = 1;
const text = [
MARK,
`

  The approach of dawn has turned
the sky a milky grey-green, like
jade. The sea is a luminous pane
of silver. Holding the tiller of
your sailing boat, you keep your
gaze fixed on the glittering
constellation known as the Spider.
It marks the north, and by keeping
it to port you know you are still
on course.

  The sun appears in a trembling
burst of red fire at the rim of
the world. Slowly the chill of
night gives way to brazen warmth.
You lick your parched lips. There
is a little water sloshing in the
bottom of the barrel by your feet,`,
MARK,
`but not enough to see you through
another day.

  Sealed in a scroll case tucked
into your jerkin is the parchment
map your grandfather gave you on
his death-bed. You remember his
stirring tales of far sea voyages,
of kingdoms beyond the western
horizon, of sorcerous islands and
ruined palaces filled with
treasure. As a child you dreamed
of nothing else but the magical
quests that were in store if you
too became an adventurer.

  You never expected to die in an
open boat before your adventures
even began.
`,
MARK,
`  Securing the tiller, you unroll
the map and study it again. You
hardly need to. Every detail is
etched into your memory by now.
According to your reckoning, you
should have reached the east coast
of Harkuna, the great northern
continent, days ago.

  A pasty grey blob splatters on to
the map. After a moment of stunned
surprise, you look up and curse
the seagull circling directly
overhead. Then it strikes you -
where there's a seagull, there may
be land.

  You leap to your feet and scan
the horizon. Sure enough, a line
of white cliffs lie a league to`,
MARK,
`the north. Have you been sailing
along the coast all this time
without realising the mainland was
so close?

  Steering towards the cliffs, you
feel the boat judder against rough
waves. A howling wind whips plumes
of spindrift across the sea.
Breakers pound the high cliffs.
The tiller is yanked out of your
hands. The little boat is spun
around, out of control, and goes
plunging in towards the coast.

  You leap clear at the last
second. There is the snap of
timber, the roaring crescendo of
the waves - and then silence as
you go under. Striking out wildly,`,
MARK,
`you try to swim clear of the
razor-sharp rocks. For a while the
undertow threatens to drag you
down, then suddenly a wave catches
you and flings you contemptuously
up on to the beach.

  Battered and bedraggled you lie
gasping for breath until you hear
someone walking along the shore
towards you. Wary of danger, you
lose no time in getting to your
feet. Confronting you is an old
man clad in a dirty loin-cloth.
His eyes have a feverish bright
look that is suggestive of either
a mystic or a madman.

  Now`,
GOTO,
"Book1/20.js",
`go to 20`,
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
