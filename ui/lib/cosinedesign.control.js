/**
 * Created by cosinezero on 6/25/2015.
 */

// TODO: add 'nudge' and 'drag', to shorten/lengthen tempo slightly
// TODO: add 'phase' to modify tempo offset
// TODO: add midi API access to local devices...


//// pack items into associative array based on prop
//function pack (items, prop) {
//    var out = {};
//    each(items, function (item) {
//        out[item[prop]]=item;
//    });
//    return out;
//}

function sort(a, b, prop) {
    if (a[prop] < b[prop]) {
        return -1;
    }
    if (a[prop] > b[prop]) {
        return 1;
    }
    // a must be equal to b
    return 0;
}

function find(items, filter) {
    return each(items, function (item, index) {
        if (filter(item, index)) return item;
    }, true);
}

// pack array of objects into associative array based on propName
// - for an array of objects [{id: 'a', ...}, {id: 'b', ...}]
//     we should get an object {a: {id: 'a', ...}, b: {id: 'b', ...}}
function pack (els, prop) {
    var out = {};
    each(els, function (item) {
        var key = item[prop];
        if (key) out[key]=item;
    });
    return out;
}

// blend values of one object with values of another with callback
function blend (a, b, callback) {
    each(a, function (item, key) {
        callback(item, b[key], key);
    });
}

// if short is true, and callback returns something, stop the loop.
// returns first result if short is true, all results if short is false.
function each(items, callback, short) {
    var i, keys, key, l, item, map = [];

    if (Array.isArray(items)) {
        l = items.length;
    } else {
        keys = Object.keys(items);
        l = keys.length;
    }

    for (i=0;i<l;i++) {
        if (keys) {
            key = keys[i];
            item = callback(items[key], key);
        } else {
            item = callback(items[i], i);
        }

        if (item) {
            if (short) return item;
            map.push(item);
        }
    }

    return map;
}

//// if short is true, and callback returns something, stop the loop.
//function each(items, callback, short) {
//    var i, length=items.length, item;
//    for (i=0;i<length;i++) {
//        item = items[i];
//        var result = callback(item, i);
//        if (short && result) return result;
//    }
//}

function avg(values) {
    var sum = 0, length = values.length, i;
    for(i = 0; i < length; i++ ){
        sum += values[i];
    }
    return sum/length;
}

var tempoControl = (function () {
    var elements = {

        },
        ms= {
            cur: 500,
            avg: 500,
            cum: 500
        },
        bpms = {
            cur: 128,
            avg: 128,
            cum: 128
        },
        tempo = 120,
        intervals = {},
        pulse = 250;

    function msToBPM(ms) {
        if (ms) {
            var t = 60000/ms;
            return Math.round(t*100)/100;
        } else {
            return ms;
        }
    }

    var tapClick = (function () {
        var x = new Date();
        var lastClickTime = x.getTime(),
            barClicks = [],
            avgClicks = [];

        return function () {
            var d = new Date();
            var t = d.getTime();
            ms.cur = t - lastClickTime;
            lastClickTime = t;
            if (ms.cur) {
                barClicks.push(ms.cur);
                ms.avg = avg(barClicks);
                avgClicks.push(ms.avg);
                ms.cum = avg(avgClicks);
            }
            if (barClicks.length > 4) barClicks.shift();
            if (avgClicks.length > 4) avgClicks.shift();

            clearIntervals();
            render();
            event.stopPropagation();
        };
    })();

    function clearIntervals() {
        each(ms, function (item, key) {
            clearInterval(intervals[key]);
        });
    }

    function init() {
        //transport: document.getElementById('transport'),
        elements.tapTempo = document.getElementById('tapTempo');
        elements.tempoDisplay =  document.getElementById('tempoDisplay');
        var _bpms = elements.tempoDisplay.getElementsByClassName('bpm');
        elements.bpms = pack(_bpms, 'id');
        each(elements.bpms, function (ele, key) {
            ele.addEventListener('click', function () {
                clearIntervals();
                tempo = msToBPM(ms[key]);
                elements.tapTempo.innerHTML = tempo;
            });
        });

        elements.tapTempo.addEventListener('click', tapClick);
    }

    function render() {
        blend(elements.bpms, ms, function (el, m, key) {
            el.innerHTML = msToBPM(m);
            intervals[key] = setInterval(function () {
                el.classList.add('beat');
                setTimeout(function () {
                    el.classList.remove('beat');
                }, pulse);
            }, m);
        });
    }

    if(document.readyState === 'complete'){
        init();
    } else {
        window.addEventListener("load", init);
    }

    return {
        tempo: tempo
    };
})();


// TODO: create pattern grid like ableton
// - xox-style sequencer
// - ableton pattern sequencer (grid of patterns
//     you can turn on / off)

// pattern is n channels of sequences

var debug = true;

(function () {
    var elements = {},
        config = {
            pattern: {
                steps: 16,
                channels: 2
            },
            buttons: {
                width: 30,
                padding: 2
            }
        },
    // starting sequence
        activeSequence = 0,
        activeBar = 0,
        pattern = {
            sequences: [
                [{ step: 0 },
                    { step: 4 },
                    { step: 8 },
                    { step: 12 }]
            ]
        };

    var renderer = {
        sequence: function (s, index) {
            // iterate each action
            var len = s.length,
                c = createChannel(),
                e = createEdit();

            elements.display.appendChild(c);
            elements.sidebar.appendChild(e);

            if (activeSequence == index) {
                e.classList.add('on');
            } else {
                e.classList.remove('on');
                e.addEventListener('click', function () {
                    activeSequence = index;
                    render();
                });
            }


            if (len == 0) {
                c.appendChild(createAction(config.pattern.steps).setSpacer());
            } else {
                s.sort(sortActions);
                each(s, function (a, i) {
                    var next;

                    // if we're the last action
                    if (i == len-1) {
                        next = config.pattern.steps;
                    } else {
                        next = s[i+1].step;
                    }
                    // determine its length
                    a.length = next - a.step;

                    // if we're the first action insert a spacer
                    if (i == 0) {
                        if (a.step != 0) {
                            // insert a non-action div into the display
                            c.appendChild(createAction(a.step).setSpacer());
                        }
                    }
                    // create action div
                    c.appendChild(createAction(a.length));

                    if (debug) {
                        // if (debug) actionDiv.innerHTML = action.step + ":" + action.length + ":" + getActionWidth(action.length);
                        document.getElementById('debug').innerHTML = JSON.stringify(pattern);
                    }
                    return;
                });
            }
        },
        buttons: function (s) {
            // iterate through actions, turn on buttons that corelate
            each(s, function (a, i) {
                elements.buttons[a.step].classList.add('on');
            });
        },
        clearButtons: function () {
            each(elements.buttons, function (b) {
                if (b.classList) b.classList.remove('on');
            });
        }
    }

    if(document.readyState === 'complete'){
        init();
    } else {
        window.addEventListener("load", init);
    }

    function init() {
        // load elements
        elements.xox = document.getElementsByClassName('xox')[0];
        elements.display = elements.xox.getElementsByClassName('display')[0];
        elements.buttons = elements.xox.getElementsByClassName('button');
        elements.barSelector = document.getElementById('barSelector');
        elements.barSelectors = elements.barSelector.getElementsByClassName('square');
        elements.sidebar = document.getElementById('sidebar');

        //assign click handlers to buttons
        addButtonHandlers(elements.buttons);
        render();
    }

    function render() {
        deleteChildren(elements.display);
        deleteChildren(elements.sidebar);

        each(elements.barSelectors, function (el, i) {
            if (i == activeBar) {
                el.classList.add('on');
            }
        });
        // render the sequences
        each(pattern.sequences, function (s, i) {
            // this needs to update just the display without deleting all
            renderer.sequence(s, i);
            // if seq is current render buttons next
            if (activeSequence == i) {
                renderer.clearButtons();
                renderer.buttons(s);
            }
        });
        // render the buttons
        var addSeq = createEdit();
        addSeq.classList.add('add');
        addSeq.innerHTML = "+";
        elements.sidebar.appendChild(addSeq);
        addSeq.addEventListener('click', function () {
            pattern.sequences.push([]);
            activeSequence = pattern.sequences.length-1;
            render();
        });
    }

    function deleteChildren (element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    function addButtonHandlers(els) {
        var i, count = els.length, btn;

        for (i=0; i<count; i++) {
            btn = els[i];
            // enclose scope for i
            (function (index) {
                btn.onclick = function () {
                    xoxButtonClick(index);
                };
            })(i);
        }
    }

    function xoxButtonClick(stepId) {
        // Toggle step
        var index,
            button = elements.buttons[stepId],
            seq = pattern.sequences[activeSequence];

        var action = find(seq, function (a, i) {
            index = i;
            return a.step == stepId;
        });

        if (action) {
            // Remove step
            seq.splice(index, 1);
            button.classList.remove('on');
        } else {
            // Add step
            seq.push({ step: stepId });
            button.classList.add('on');
        }

        render();
    }

    function getAction(stepId) {
        return find(sequence, function (a) {
            return a.step == stepId;
        });
    }

    function sortActions (a, b) {
        return sort(a, b, 'step');
    }

    function createAction(size) {
        var a = document.createElement('div');
        a.style.width = getActionWidth(size);
        a.className = 'action';
        a.setSpacer = setSpacer;
        return a;
    }

    function createEdit() {
        var e = document.createElement('div');
        e.className = 'edit';
        return e;

    }

    function createChannel() {
        var c = document.createElement('div');
        c.className = 'channel';
        return c;
    }

    function setSpacer() {
        this.classList.add('spacer');
        return this;
    }

    //function updateButtons(seq) {
    //    // clear all buttons
    //    // iterate through actions, turn on buttons that corelate
    //    each(seq, function (action, index) {
    //        elements.buttons[action.step].classList.add('on');
    //    });
    //}

    function getActionWidth(stepLength) {
        return (stepLength * (config.buttons.width + (2*config.buttons.padding))) - (2*config.buttons.padding) + 'px';
    }
})();
