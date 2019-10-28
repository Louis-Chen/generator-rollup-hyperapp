
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
this.bundle = this.bundle || {};
this.bundle.js = (function (exports) {
  'use strict';

  var RECYCLED_NODE = 1;
  var LAZY_NODE = 2;
  var TEXT_NODE = 3;
  var EMPTY_OBJ = {};
  var EMPTY_ARR = [];
  var map = EMPTY_ARR.map;
  var isArray = Array.isArray;
  var defer =
    typeof requestAnimationFrame !== "undefined"
      ? requestAnimationFrame
      : setTimeout;

  var createClass = function(obj) {
    var out = "";

    if (typeof obj === "string") return obj

    if (isArray(obj) && obj.length > 0) {
      for (var k = 0, tmp; k < obj.length; k++) {
        if ((tmp = createClass(obj[k])) !== "") {
          out += (out && " ") + tmp;
        }
      }
    } else {
      for (var k in obj) {
        if (obj[k]) {
          out += (out && " ") + k;
        }
      }
    }

    return out
  };

  var merge = function(a, b) {
    var out = {};

    for (var k in a) out[k] = a[k];
    for (var k in b) out[k] = b[k];

    return out
  };

  var batch = function(list) {
    return list.reduce(function(out, item) {
      return out.concat(
        !item || item === true
          ? 0
          : typeof item[0] === "function"
          ? [item]
          : batch(item)
      )
    }, EMPTY_ARR)
  };

  var isSameAction = function(a, b) {
    return isArray(a) && isArray(b) && a[0] === b[0] && typeof a[0] === "function"
  };

  var shouldRestart = function(a, b) {
    if (a !== b) {
      for (var k in merge(a, b)) {
        if (a[k] !== b[k] && !isSameAction(a[k], b[k])) return true
        b[k] = a[k];
      }
    }
  };

  var patchSubs = function(oldSubs, newSubs, dispatch) {
    for (
      var i = 0, oldSub, newSub, subs = [];
      i < oldSubs.length || i < newSubs.length;
      i++
    ) {
      oldSub = oldSubs[i];
      newSub = newSubs[i];
      subs.push(
        newSub
          ? !oldSub ||
            newSub[0] !== oldSub[0] ||
            shouldRestart(newSub[1], oldSub[1])
            ? [
                newSub[0],
                newSub[1],
                newSub[0](dispatch, newSub[1]),
                oldSub && oldSub[2]()
              ]
            : oldSub
          : oldSub && oldSub[2]()
      );
    }
    return subs
  };

  var patchProperty = function(node, key, oldValue, newValue, listener, isSvg) {
    if (key === "key") ; else if (key === "style") {
      for (var k in merge(oldValue, newValue)) {
        oldValue = newValue == null || newValue[k] == null ? "" : newValue[k];
        if (k[0] === "-") {
          node[key].setProperty(k, oldValue);
        } else {
          node[key][k] = oldValue;
        }
      }
    } else if (key[0] === "o" && key[1] === "n") {
      if (
        !((node.actions || (node.actions = {}))[
          (key = key.slice(2).toLowerCase())
        ] = newValue)
      ) {
        node.removeEventListener(key, listener);
      } else if (!oldValue) {
        node.addEventListener(key, listener);
      }
    } else if (!isSvg && key !== "list" && key in node) {
      node[key] = newValue == null ? "" : newValue;
    } else if (
      newValue == null ||
      newValue === false ||
      (key === "class" && !(newValue = createClass(newValue)))
    ) {
      node.removeAttribute(key);
    } else {
      node.setAttribute(key, newValue);
    }
  };

  var createNode = function(vdom, listener, isSvg) {
    var ns = "http://www.w3.org/2000/svg";
    var props = vdom.props;
    var node =
      vdom.type === TEXT_NODE
        ? document.createTextNode(vdom.name)
        : (isSvg = isSvg || vdom.name === "svg")
        ? document.createElementNS(ns, vdom.name, { is: props.is })
        : document.createElement(vdom.name, { is: props.is });

    for (var k in props) {
      patchProperty(node, k, null, props[k], listener, isSvg);
    }

    for (var i = 0, len = vdom.children.length; i < len; i++) {
      node.appendChild(
        createNode(
          (vdom.children[i] = getVNode(vdom.children[i])),
          listener,
          isSvg
        )
      );
    }

    return (vdom.node = node)
  };

  var getKey = function(vdom) {
    return vdom == null ? null : vdom.key
  };

  var patch = function(parent, node, oldVNode, newVNode, listener, isSvg) {
    if (oldVNode === newVNode) ; else if (
      oldVNode != null &&
      oldVNode.type === TEXT_NODE &&
      newVNode.type === TEXT_NODE
    ) {
      if (oldVNode.name !== newVNode.name) node.nodeValue = newVNode.name;
    } else if (oldVNode == null || oldVNode.name !== newVNode.name) {
      node = parent.insertBefore(
        createNode((newVNode = getVNode(newVNode)), listener, isSvg),
        node
      );
      if (oldVNode != null) {
        parent.removeChild(oldVNode.node);
      }
    } else {
      var tmpVKid;
      var oldVKid;

      var oldKey;
      var newKey;

      var oldVProps = oldVNode.props;
      var newVProps = newVNode.props;

      var oldVKids = oldVNode.children;
      var newVKids = newVNode.children;

      var oldHead = 0;
      var newHead = 0;
      var oldTail = oldVKids.length - 1;
      var newTail = newVKids.length - 1;

      isSvg = isSvg || newVNode.name === "svg";

      for (var i in merge(oldVProps, newVProps)) {
        if (
          (i === "value" || i === "selected" || i === "checked"
            ? node[i]
            : oldVProps[i]) !== newVProps[i]
        ) {
          patchProperty(node, i, oldVProps[i], newVProps[i], listener, isSvg);
        }
      }

      while (newHead <= newTail && oldHead <= oldTail) {
        if (
          (oldKey = getKey(oldVKids[oldHead])) == null ||
          oldKey !== getKey(newVKids[newHead])
        ) {
          break
        }

        patch(
          node,
          oldVKids[oldHead].node,
          oldVKids[oldHead],
          (newVKids[newHead] = getVNode(
            newVKids[newHead++],
            oldVKids[oldHead++]
          )),
          listener,
          isSvg
        );
      }

      while (newHead <= newTail && oldHead <= oldTail) {
        if (
          (oldKey = getKey(oldVKids[oldTail])) == null ||
          oldKey !== getKey(newVKids[newTail])
        ) {
          break
        }

        patch(
          node,
          oldVKids[oldTail].node,
          oldVKids[oldTail],
          (newVKids[newTail] = getVNode(
            newVKids[newTail--],
            oldVKids[oldTail--]
          )),
          listener,
          isSvg
        );
      }

      if (oldHead > oldTail) {
        while (newHead <= newTail) {
          node.insertBefore(
            createNode(
              (newVKids[newHead] = getVNode(newVKids[newHead++])),
              listener,
              isSvg
            ),
            (oldVKid = oldVKids[oldHead]) && oldVKid.node
          );
        }
      } else if (newHead > newTail) {
        while (oldHead <= oldTail) {
          node.removeChild(oldVKids[oldHead++].node);
        }
      } else {
        for (var i = oldHead, keyed = {}, newKeyed = {}; i <= oldTail; i++) {
          if ((oldKey = oldVKids[i].key) != null) {
            keyed[oldKey] = oldVKids[i];
          }
        }

        while (newHead <= newTail) {
          oldKey = getKey((oldVKid = oldVKids[oldHead]));
          newKey = getKey(
            (newVKids[newHead] = getVNode(newVKids[newHead], oldVKid))
          );

          if (
            newKeyed[oldKey] ||
            (newKey != null && newKey === getKey(oldVKids[oldHead + 1]))
          ) {
            if (oldKey == null) {
              node.removeChild(oldVKid.node);
            }
            oldHead++;
            continue
          }

          if (newKey == null || oldVNode.type === RECYCLED_NODE) {
            if (oldKey == null) {
              patch(
                node,
                oldVKid && oldVKid.node,
                oldVKid,
                newVKids[newHead],
                listener,
                isSvg
              );
              newHead++;
            }
            oldHead++;
          } else {
            if (oldKey === newKey) {
              patch(
                node,
                oldVKid.node,
                oldVKid,
                newVKids[newHead],
                listener,
                isSvg
              );
              newKeyed[newKey] = true;
              oldHead++;
            } else {
              if ((tmpVKid = keyed[newKey]) != null) {
                patch(
                  node,
                  node.insertBefore(tmpVKid.node, oldVKid && oldVKid.node),
                  tmpVKid,
                  newVKids[newHead],
                  listener,
                  isSvg
                );
                newKeyed[newKey] = true;
              } else {
                patch(
                  node,
                  oldVKid && oldVKid.node,
                  null,
                  newVKids[newHead],
                  listener,
                  isSvg
                );
              }
            }
            newHead++;
          }
        }

        while (oldHead <= oldTail) {
          if (getKey((oldVKid = oldVKids[oldHead++])) == null) {
            node.removeChild(oldVKid.node);
          }
        }

        for (var i in keyed) {
          if (newKeyed[i] == null) {
            node.removeChild(keyed[i].node);
          }
        }
      }
    }

    return (newVNode.node = node)
  };

  var propsChanged = function(a, b) {
    for (var k in a) if (a[k] !== b[k]) return true
    for (var k in b) if (a[k] !== b[k]) return true
  };

  var getTextVNode = function(node) {
    return typeof node === "object" ? node : createTextVNode(node)
  };

  var getVNode = function(newVNode, oldVNode) {
    return newVNode.type === LAZY_NODE
      ? ((!oldVNode ||
          (oldVNode.type !== LAZY_NODE ||
            propsChanged(oldVNode.lazy, newVNode.lazy))) &&
          ((oldVNode = getTextVNode(newVNode.lazy.view(newVNode.lazy))).lazy =
            newVNode.lazy),
        oldVNode)
      : newVNode
  };

  var createVNode = function(name, props, children, node, key, type) {
    return {
      name: name,
      props: props,
      children: children,
      node: node,
      type: type,
      key: key
    }
  };

  var createTextVNode = function(value, node) {
    return createVNode(value, EMPTY_OBJ, EMPTY_ARR, node, undefined, TEXT_NODE)
  };

  var recycleNode = function(node) {
    return node.nodeType === TEXT_NODE
      ? createTextVNode(node.nodeValue, node)
      : createVNode(
          node.nodeName.toLowerCase(),
          EMPTY_OBJ,
          map.call(node.childNodes, recycleNode),
          node,
          undefined,
          RECYCLED_NODE
        )
  };

  var h = function(name, props) {
    for (var vdom, rest = [], children = [], i = arguments.length; i-- > 2; ) {
      rest.push(arguments[i]);
    }

    while (rest.length > 0) {
      if (isArray((vdom = rest.pop()))) {
        for (var i = vdom.length; i-- > 0; ) {
          rest.push(vdom[i]);
        }
      } else if (vdom === false || vdom === true || vdom == null) ; else {
        children.push(getTextVNode(vdom));
      }
    }

    props = props || EMPTY_OBJ;

    return typeof name === "function"
      ? name(props, children)
      : createVNode(name, props, children, undefined, props.key)
  };

  var app = function(props) {
    var state = {};
    var lock = false;
    var view = props.view;
    var node = props.node;
    var vdom = node && recycleNode(node);
    var subscriptions = props.subscriptions;
    var subs = [];

    var listener = function(event) {
      dispatch(this.actions[event.type], event);
    };

    var setState = function(newState) {
      if (state !== newState) {
        state = newState;
        if (subscriptions) {
          subs = patchSubs(subs, batch([subscriptions(state)]), dispatch);
        }
        if (view && !lock) defer(render, (lock = true));
      }
      return state
    };

    var dispatch = (props.middleware ||
      function(obj) {
        return obj
      })(function(action, props) {
      return typeof action === "function"
        ? dispatch(action(state, props))
        : isArray(action)
        ? typeof action[0] === "function" || isArray(action[0])
          ? dispatch(
              action[0],
              typeof action[1] === "function" ? action[1](props) : action[1]
            )
          : (batch(action.slice(1)).map(function(fx) {
              fx && fx[0](dispatch, fx[1]);
            }, setState(action[0])),
            state)
        : setState(action)
    });

    var render = function() {
      lock = false;
      node = patch(
        node.parentNode,
        node,
        vdom,
        (vdom = getTextVNode(view(state))),
        listener
      );
    };

    dispatch(props.init);
  };

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;

    if (!css || typeof document === 'undefined') { return; }

    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';

    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css = ".app{width:100px;height:100px;background-color:#dcdcdc}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxLQUNJLFdBQVcsQ0FDWCxZQUFhLENBQ2Isd0JBQTJCIiwiZmlsZSI6ImFwcC5zY3NzIn0= */";
  styleInject(css);

  const actions = {
    down: value => state => ({
      count: state.count - value
    })
  };
  const state = {
    count: 0
  };

  const view = (state, actions) => {
    return h("div", null, h("div", {
      className: "app"
    }, "test scss"), h("h1", null, state.count), h("button", {
      onclick: () => actions.down(1)
    }, "-"));
  };

  const main = app(state, actions, view, document.getElementById('root'));

  exports.main = main;

  return exports;

}({}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9ub2RlX21vZHVsZXMvaHlwZXJhcHAvc3JjL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWluamVjdC9kaXN0L3N0eWxlLWluamVjdC5lcy5qcyIsIi4uL3NyYy9hcHAuanMiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIFJFQ1lDTEVEX05PREUgPSAxXG52YXIgTEFaWV9OT0RFID0gMlxudmFyIFRFWFRfTk9ERSA9IDNcbnZhciBFTVBUWV9PQkogPSB7fVxudmFyIEVNUFRZX0FSUiA9IFtdXG52YXIgbWFwID0gRU1QVFlfQVJSLm1hcFxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5XG52YXIgZGVmZXIgPVxuICB0eXBlb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lICE9PSBcInVuZGVmaW5lZFwiXG4gICAgPyByZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICA6IHNldFRpbWVvdXRcblxudmFyIGNyZWF0ZUNsYXNzID0gZnVuY3Rpb24ob2JqKSB7XG4gIHZhciBvdXQgPSBcIlwiXG5cbiAgaWYgKHR5cGVvZiBvYmogPT09IFwic3RyaW5nXCIpIHJldHVybiBvYmpcblxuICBpZiAoaXNBcnJheShvYmopICYmIG9iai5sZW5ndGggPiAwKSB7XG4gICAgZm9yICh2YXIgayA9IDAsIHRtcDsgayA8IG9iai5sZW5ndGg7IGsrKykge1xuICAgICAgaWYgKCh0bXAgPSBjcmVhdGVDbGFzcyhvYmpba10pKSAhPT0gXCJcIikge1xuICAgICAgICBvdXQgKz0gKG91dCAmJiBcIiBcIikgKyB0bXBcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZm9yICh2YXIgayBpbiBvYmopIHtcbiAgICAgIGlmIChvYmpba10pIHtcbiAgICAgICAgb3V0ICs9IChvdXQgJiYgXCIgXCIpICsga1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvdXRcbn1cblxudmFyIG1lcmdlID0gZnVuY3Rpb24oYSwgYikge1xuICB2YXIgb3V0ID0ge31cblxuICBmb3IgKHZhciBrIGluIGEpIG91dFtrXSA9IGFba11cbiAgZm9yICh2YXIgayBpbiBiKSBvdXRba10gPSBiW2tdXG5cbiAgcmV0dXJuIG91dFxufVxuXG52YXIgYmF0Y2ggPSBmdW5jdGlvbihsaXN0KSB7XG4gIHJldHVybiBsaXN0LnJlZHVjZShmdW5jdGlvbihvdXQsIGl0ZW0pIHtcbiAgICByZXR1cm4gb3V0LmNvbmNhdChcbiAgICAgICFpdGVtIHx8IGl0ZW0gPT09IHRydWVcbiAgICAgICAgPyAwXG4gICAgICAgIDogdHlwZW9mIGl0ZW1bMF0gPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICA/IFtpdGVtXVxuICAgICAgICA6IGJhdGNoKGl0ZW0pXG4gICAgKVxuICB9LCBFTVBUWV9BUlIpXG59XG5cbnZhciBpc1NhbWVBY3Rpb24gPSBmdW5jdGlvbihhLCBiKSB7XG4gIHJldHVybiBpc0FycmF5KGEpICYmIGlzQXJyYXkoYikgJiYgYVswXSA9PT0gYlswXSAmJiB0eXBlb2YgYVswXSA9PT0gXCJmdW5jdGlvblwiXG59XG5cbnZhciBzaG91bGRSZXN0YXJ0ID0gZnVuY3Rpb24oYSwgYikge1xuICBpZiAoYSAhPT0gYikge1xuICAgIGZvciAodmFyIGsgaW4gbWVyZ2UoYSwgYikpIHtcbiAgICAgIGlmIChhW2tdICE9PSBiW2tdICYmICFpc1NhbWVBY3Rpb24oYVtrXSwgYltrXSkpIHJldHVybiB0cnVlXG4gICAgICBiW2tdID0gYVtrXVxuICAgIH1cbiAgfVxufVxuXG52YXIgcGF0Y2hTdWJzID0gZnVuY3Rpb24ob2xkU3VicywgbmV3U3VicywgZGlzcGF0Y2gpIHtcbiAgZm9yIChcbiAgICB2YXIgaSA9IDAsIG9sZFN1YiwgbmV3U3ViLCBzdWJzID0gW107XG4gICAgaSA8IG9sZFN1YnMubGVuZ3RoIHx8IGkgPCBuZXdTdWJzLmxlbmd0aDtcbiAgICBpKytcbiAgKSB7XG4gICAgb2xkU3ViID0gb2xkU3Vic1tpXVxuICAgIG5ld1N1YiA9IG5ld1N1YnNbaV1cbiAgICBzdWJzLnB1c2goXG4gICAgICBuZXdTdWJcbiAgICAgICAgPyAhb2xkU3ViIHx8XG4gICAgICAgICAgbmV3U3ViWzBdICE9PSBvbGRTdWJbMF0gfHxcbiAgICAgICAgICBzaG91bGRSZXN0YXJ0KG5ld1N1YlsxXSwgb2xkU3ViWzFdKVxuICAgICAgICAgID8gW1xuICAgICAgICAgICAgICBuZXdTdWJbMF0sXG4gICAgICAgICAgICAgIG5ld1N1YlsxXSxcbiAgICAgICAgICAgICAgbmV3U3ViWzBdKGRpc3BhdGNoLCBuZXdTdWJbMV0pLFxuICAgICAgICAgICAgICBvbGRTdWIgJiYgb2xkU3ViWzJdKClcbiAgICAgICAgICAgIF1cbiAgICAgICAgICA6IG9sZFN1YlxuICAgICAgICA6IG9sZFN1YiAmJiBvbGRTdWJbMl0oKVxuICAgIClcbiAgfVxuICByZXR1cm4gc3Vic1xufVxuXG52YXIgcGF0Y2hQcm9wZXJ0eSA9IGZ1bmN0aW9uKG5vZGUsIGtleSwgb2xkVmFsdWUsIG5ld1ZhbHVlLCBsaXN0ZW5lciwgaXNTdmcpIHtcbiAgaWYgKGtleSA9PT0gXCJrZXlcIikge1xuICB9IGVsc2UgaWYgKGtleSA9PT0gXCJzdHlsZVwiKSB7XG4gICAgZm9yICh2YXIgayBpbiBtZXJnZShvbGRWYWx1ZSwgbmV3VmFsdWUpKSB7XG4gICAgICBvbGRWYWx1ZSA9IG5ld1ZhbHVlID09IG51bGwgfHwgbmV3VmFsdWVba10gPT0gbnVsbCA/IFwiXCIgOiBuZXdWYWx1ZVtrXVxuICAgICAgaWYgKGtbMF0gPT09IFwiLVwiKSB7XG4gICAgICAgIG5vZGVba2V5XS5zZXRQcm9wZXJ0eShrLCBvbGRWYWx1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vZGVba2V5XVtrXSA9IG9sZFZhbHVlXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKGtleVswXSA9PT0gXCJvXCIgJiYga2V5WzFdID09PSBcIm5cIikge1xuICAgIGlmIChcbiAgICAgICEoKG5vZGUuYWN0aW9ucyB8fCAobm9kZS5hY3Rpb25zID0ge30pKVtcbiAgICAgICAgKGtleSA9IGtleS5zbGljZSgyKS50b0xvd2VyQ2FzZSgpKVxuICAgICAgXSA9IG5ld1ZhbHVlKVxuICAgICkge1xuICAgICAgbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKGtleSwgbGlzdGVuZXIpXG4gICAgfSBlbHNlIGlmICghb2xkVmFsdWUpIHtcbiAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihrZXksIGxpc3RlbmVyKVxuICAgIH1cbiAgfSBlbHNlIGlmICghaXNTdmcgJiYga2V5ICE9PSBcImxpc3RcIiAmJiBrZXkgaW4gbm9kZSkge1xuICAgIG5vZGVba2V5XSA9IG5ld1ZhbHVlID09IG51bGwgPyBcIlwiIDogbmV3VmFsdWVcbiAgfSBlbHNlIGlmIChcbiAgICBuZXdWYWx1ZSA9PSBudWxsIHx8XG4gICAgbmV3VmFsdWUgPT09IGZhbHNlIHx8XG4gICAgKGtleSA9PT0gXCJjbGFzc1wiICYmICEobmV3VmFsdWUgPSBjcmVhdGVDbGFzcyhuZXdWYWx1ZSkpKVxuICApIHtcbiAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZShrZXkpXG4gIH0gZWxzZSB7XG4gICAgbm9kZS5zZXRBdHRyaWJ1dGUoa2V5LCBuZXdWYWx1ZSlcbiAgfVxufVxuXG52YXIgY3JlYXRlTm9kZSA9IGZ1bmN0aW9uKHZkb20sIGxpc3RlbmVyLCBpc1N2Zykge1xuICB2YXIgbnMgPSBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCJcbiAgdmFyIHByb3BzID0gdmRvbS5wcm9wc1xuICB2YXIgbm9kZSA9XG4gICAgdmRvbS50eXBlID09PSBURVhUX05PREVcbiAgICAgID8gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodmRvbS5uYW1lKVxuICAgICAgOiAoaXNTdmcgPSBpc1N2ZyB8fCB2ZG9tLm5hbWUgPT09IFwic3ZnXCIpXG4gICAgICA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgdmRvbS5uYW1lLCB7IGlzOiBwcm9wcy5pcyB9KVxuICAgICAgOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHZkb20ubmFtZSwgeyBpczogcHJvcHMuaXMgfSlcblxuICBmb3IgKHZhciBrIGluIHByb3BzKSB7XG4gICAgcGF0Y2hQcm9wZXJ0eShub2RlLCBrLCBudWxsLCBwcm9wc1trXSwgbGlzdGVuZXIsIGlzU3ZnKVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHZkb20uY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBub2RlLmFwcGVuZENoaWxkKFxuICAgICAgY3JlYXRlTm9kZShcbiAgICAgICAgKHZkb20uY2hpbGRyZW5baV0gPSBnZXRWTm9kZSh2ZG9tLmNoaWxkcmVuW2ldKSksXG4gICAgICAgIGxpc3RlbmVyLFxuICAgICAgICBpc1N2Z1xuICAgICAgKVxuICAgIClcbiAgfVxuXG4gIHJldHVybiAodmRvbS5ub2RlID0gbm9kZSlcbn1cblxudmFyIGdldEtleSA9IGZ1bmN0aW9uKHZkb20pIHtcbiAgcmV0dXJuIHZkb20gPT0gbnVsbCA/IG51bGwgOiB2ZG9tLmtleVxufVxuXG52YXIgcGF0Y2ggPSBmdW5jdGlvbihwYXJlbnQsIG5vZGUsIG9sZFZOb2RlLCBuZXdWTm9kZSwgbGlzdGVuZXIsIGlzU3ZnKSB7XG4gIGlmIChvbGRWTm9kZSA9PT0gbmV3Vk5vZGUpIHtcbiAgfSBlbHNlIGlmIChcbiAgICBvbGRWTm9kZSAhPSBudWxsICYmXG4gICAgb2xkVk5vZGUudHlwZSA9PT0gVEVYVF9OT0RFICYmXG4gICAgbmV3Vk5vZGUudHlwZSA9PT0gVEVYVF9OT0RFXG4gICkge1xuICAgIGlmIChvbGRWTm9kZS5uYW1lICE9PSBuZXdWTm9kZS5uYW1lKSBub2RlLm5vZGVWYWx1ZSA9IG5ld1ZOb2RlLm5hbWVcbiAgfSBlbHNlIGlmIChvbGRWTm9kZSA9PSBudWxsIHx8IG9sZFZOb2RlLm5hbWUgIT09IG5ld1ZOb2RlLm5hbWUpIHtcbiAgICBub2RlID0gcGFyZW50Lmluc2VydEJlZm9yZShcbiAgICAgIGNyZWF0ZU5vZGUoKG5ld1ZOb2RlID0gZ2V0Vk5vZGUobmV3Vk5vZGUpKSwgbGlzdGVuZXIsIGlzU3ZnKSxcbiAgICAgIG5vZGVcbiAgICApXG4gICAgaWYgKG9sZFZOb2RlICE9IG51bGwpIHtcbiAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChvbGRWTm9kZS5ub2RlKVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgdG1wVktpZFxuICAgIHZhciBvbGRWS2lkXG5cbiAgICB2YXIgb2xkS2V5XG4gICAgdmFyIG5ld0tleVxuXG4gICAgdmFyIG9sZFZQcm9wcyA9IG9sZFZOb2RlLnByb3BzXG4gICAgdmFyIG5ld1ZQcm9wcyA9IG5ld1ZOb2RlLnByb3BzXG5cbiAgICB2YXIgb2xkVktpZHMgPSBvbGRWTm9kZS5jaGlsZHJlblxuICAgIHZhciBuZXdWS2lkcyA9IG5ld1ZOb2RlLmNoaWxkcmVuXG5cbiAgICB2YXIgb2xkSGVhZCA9IDBcbiAgICB2YXIgbmV3SGVhZCA9IDBcbiAgICB2YXIgb2xkVGFpbCA9IG9sZFZLaWRzLmxlbmd0aCAtIDFcbiAgICB2YXIgbmV3VGFpbCA9IG5ld1ZLaWRzLmxlbmd0aCAtIDFcblxuICAgIGlzU3ZnID0gaXNTdmcgfHwgbmV3Vk5vZGUubmFtZSA9PT0gXCJzdmdcIlxuXG4gICAgZm9yICh2YXIgaSBpbiBtZXJnZShvbGRWUHJvcHMsIG5ld1ZQcm9wcykpIHtcbiAgICAgIGlmIChcbiAgICAgICAgKGkgPT09IFwidmFsdWVcIiB8fCBpID09PSBcInNlbGVjdGVkXCIgfHwgaSA9PT0gXCJjaGVja2VkXCJcbiAgICAgICAgICA/IG5vZGVbaV1cbiAgICAgICAgICA6IG9sZFZQcm9wc1tpXSkgIT09IG5ld1ZQcm9wc1tpXVxuICAgICAgKSB7XG4gICAgICAgIHBhdGNoUHJvcGVydHkobm9kZSwgaSwgb2xkVlByb3BzW2ldLCBuZXdWUHJvcHNbaV0sIGxpc3RlbmVyLCBpc1N2ZylcbiAgICAgIH1cbiAgICB9XG5cbiAgICB3aGlsZSAobmV3SGVhZCA8PSBuZXdUYWlsICYmIG9sZEhlYWQgPD0gb2xkVGFpbCkge1xuICAgICAgaWYgKFxuICAgICAgICAob2xkS2V5ID0gZ2V0S2V5KG9sZFZLaWRzW29sZEhlYWRdKSkgPT0gbnVsbCB8fFxuICAgICAgICBvbGRLZXkgIT09IGdldEtleShuZXdWS2lkc1tuZXdIZWFkXSlcbiAgICAgICkge1xuICAgICAgICBicmVha1xuICAgICAgfVxuXG4gICAgICBwYXRjaChcbiAgICAgICAgbm9kZSxcbiAgICAgICAgb2xkVktpZHNbb2xkSGVhZF0ubm9kZSxcbiAgICAgICAgb2xkVktpZHNbb2xkSGVhZF0sXG4gICAgICAgIChuZXdWS2lkc1tuZXdIZWFkXSA9IGdldFZOb2RlKFxuICAgICAgICAgIG5ld1ZLaWRzW25ld0hlYWQrK10sXG4gICAgICAgICAgb2xkVktpZHNbb2xkSGVhZCsrXVxuICAgICAgICApKSxcbiAgICAgICAgbGlzdGVuZXIsXG4gICAgICAgIGlzU3ZnXG4gICAgICApXG4gICAgfVxuXG4gICAgd2hpbGUgKG5ld0hlYWQgPD0gbmV3VGFpbCAmJiBvbGRIZWFkIDw9IG9sZFRhaWwpIHtcbiAgICAgIGlmIChcbiAgICAgICAgKG9sZEtleSA9IGdldEtleShvbGRWS2lkc1tvbGRUYWlsXSkpID09IG51bGwgfHxcbiAgICAgICAgb2xkS2V5ICE9PSBnZXRLZXkobmV3VktpZHNbbmV3VGFpbF0pXG4gICAgICApIHtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cblxuICAgICAgcGF0Y2goXG4gICAgICAgIG5vZGUsXG4gICAgICAgIG9sZFZLaWRzW29sZFRhaWxdLm5vZGUsXG4gICAgICAgIG9sZFZLaWRzW29sZFRhaWxdLFxuICAgICAgICAobmV3VktpZHNbbmV3VGFpbF0gPSBnZXRWTm9kZShcbiAgICAgICAgICBuZXdWS2lkc1tuZXdUYWlsLS1dLFxuICAgICAgICAgIG9sZFZLaWRzW29sZFRhaWwtLV1cbiAgICAgICAgKSksXG4gICAgICAgIGxpc3RlbmVyLFxuICAgICAgICBpc1N2Z1xuICAgICAgKVxuICAgIH1cblxuICAgIGlmIChvbGRIZWFkID4gb2xkVGFpbCkge1xuICAgICAgd2hpbGUgKG5ld0hlYWQgPD0gbmV3VGFpbCkge1xuICAgICAgICBub2RlLmluc2VydEJlZm9yZShcbiAgICAgICAgICBjcmVhdGVOb2RlKFxuICAgICAgICAgICAgKG5ld1ZLaWRzW25ld0hlYWRdID0gZ2V0Vk5vZGUobmV3VktpZHNbbmV3SGVhZCsrXSkpLFxuICAgICAgICAgICAgbGlzdGVuZXIsXG4gICAgICAgICAgICBpc1N2Z1xuICAgICAgICAgICksXG4gICAgICAgICAgKG9sZFZLaWQgPSBvbGRWS2lkc1tvbGRIZWFkXSkgJiYgb2xkVktpZC5ub2RlXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG5ld0hlYWQgPiBuZXdUYWlsKSB7XG4gICAgICB3aGlsZSAob2xkSGVhZCA8PSBvbGRUYWlsKSB7XG4gICAgICAgIG5vZGUucmVtb3ZlQ2hpbGQob2xkVktpZHNbb2xkSGVhZCsrXS5ub2RlKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHZhciBpID0gb2xkSGVhZCwga2V5ZWQgPSB7fSwgbmV3S2V5ZWQgPSB7fTsgaSA8PSBvbGRUYWlsOyBpKyspIHtcbiAgICAgICAgaWYgKChvbGRLZXkgPSBvbGRWS2lkc1tpXS5rZXkpICE9IG51bGwpIHtcbiAgICAgICAgICBrZXllZFtvbGRLZXldID0gb2xkVktpZHNbaV1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB3aGlsZSAobmV3SGVhZCA8PSBuZXdUYWlsKSB7XG4gICAgICAgIG9sZEtleSA9IGdldEtleSgob2xkVktpZCA9IG9sZFZLaWRzW29sZEhlYWRdKSlcbiAgICAgICAgbmV3S2V5ID0gZ2V0S2V5KFxuICAgICAgICAgIChuZXdWS2lkc1tuZXdIZWFkXSA9IGdldFZOb2RlKG5ld1ZLaWRzW25ld0hlYWRdLCBvbGRWS2lkKSlcbiAgICAgICAgKVxuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBuZXdLZXllZFtvbGRLZXldIHx8XG4gICAgICAgICAgKG5ld0tleSAhPSBudWxsICYmIG5ld0tleSA9PT0gZ2V0S2V5KG9sZFZLaWRzW29sZEhlYWQgKyAxXSkpXG4gICAgICAgICkge1xuICAgICAgICAgIGlmIChvbGRLZXkgPT0gbnVsbCkge1xuICAgICAgICAgICAgbm9kZS5yZW1vdmVDaGlsZChvbGRWS2lkLm5vZGUpXG4gICAgICAgICAgfVxuICAgICAgICAgIG9sZEhlYWQrK1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmV3S2V5ID09IG51bGwgfHwgb2xkVk5vZGUudHlwZSA9PT0gUkVDWUNMRURfTk9ERSkge1xuICAgICAgICAgIGlmIChvbGRLZXkgPT0gbnVsbCkge1xuICAgICAgICAgICAgcGF0Y2goXG4gICAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICAgIG9sZFZLaWQgJiYgb2xkVktpZC5ub2RlLFxuICAgICAgICAgICAgICBvbGRWS2lkLFxuICAgICAgICAgICAgICBuZXdWS2lkc1tuZXdIZWFkXSxcbiAgICAgICAgICAgICAgbGlzdGVuZXIsXG4gICAgICAgICAgICAgIGlzU3ZnXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBuZXdIZWFkKytcbiAgICAgICAgICB9XG4gICAgICAgICAgb2xkSGVhZCsrXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKG9sZEtleSA9PT0gbmV3S2V5KSB7XG4gICAgICAgICAgICBwYXRjaChcbiAgICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgICAgb2xkVktpZC5ub2RlLFxuICAgICAgICAgICAgICBvbGRWS2lkLFxuICAgICAgICAgICAgICBuZXdWS2lkc1tuZXdIZWFkXSxcbiAgICAgICAgICAgICAgbGlzdGVuZXIsXG4gICAgICAgICAgICAgIGlzU3ZnXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBuZXdLZXllZFtuZXdLZXldID0gdHJ1ZVxuICAgICAgICAgICAgb2xkSGVhZCsrXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICgodG1wVktpZCA9IGtleWVkW25ld0tleV0pICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgcGF0Y2goXG4gICAgICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgICAgICBub2RlLmluc2VydEJlZm9yZSh0bXBWS2lkLm5vZGUsIG9sZFZLaWQgJiYgb2xkVktpZC5ub2RlKSxcbiAgICAgICAgICAgICAgICB0bXBWS2lkLFxuICAgICAgICAgICAgICAgIG5ld1ZLaWRzW25ld0hlYWRdLFxuICAgICAgICAgICAgICAgIGxpc3RlbmVyLFxuICAgICAgICAgICAgICAgIGlzU3ZnXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgbmV3S2V5ZWRbbmV3S2V5XSA9IHRydWVcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHBhdGNoKFxuICAgICAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICAgICAgb2xkVktpZCAmJiBvbGRWS2lkLm5vZGUsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBuZXdWS2lkc1tuZXdIZWFkXSxcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcixcbiAgICAgICAgICAgICAgICBpc1N2Z1xuICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIG5ld0hlYWQrK1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHdoaWxlIChvbGRIZWFkIDw9IG9sZFRhaWwpIHtcbiAgICAgICAgaWYgKGdldEtleSgob2xkVktpZCA9IG9sZFZLaWRzW29sZEhlYWQrK10pKSA9PSBudWxsKSB7XG4gICAgICAgICAgbm9kZS5yZW1vdmVDaGlsZChvbGRWS2lkLm5vZGUpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSBpbiBrZXllZCkge1xuICAgICAgICBpZiAobmV3S2V5ZWRbaV0gPT0gbnVsbCkge1xuICAgICAgICAgIG5vZGUucmVtb3ZlQ2hpbGQoa2V5ZWRbaV0ubm9kZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAobmV3Vk5vZGUubm9kZSA9IG5vZGUpXG59XG5cbnZhciBwcm9wc0NoYW5nZWQgPSBmdW5jdGlvbihhLCBiKSB7XG4gIGZvciAodmFyIGsgaW4gYSkgaWYgKGFba10gIT09IGJba10pIHJldHVybiB0cnVlXG4gIGZvciAodmFyIGsgaW4gYikgaWYgKGFba10gIT09IGJba10pIHJldHVybiB0cnVlXG59XG5cbnZhciBnZXRUZXh0Vk5vZGUgPSBmdW5jdGlvbihub2RlKSB7XG4gIHJldHVybiB0eXBlb2Ygbm9kZSA9PT0gXCJvYmplY3RcIiA/IG5vZGUgOiBjcmVhdGVUZXh0Vk5vZGUobm9kZSlcbn1cblxudmFyIGdldFZOb2RlID0gZnVuY3Rpb24obmV3Vk5vZGUsIG9sZFZOb2RlKSB7XG4gIHJldHVybiBuZXdWTm9kZS50eXBlID09PSBMQVpZX05PREVcbiAgICA/ICgoIW9sZFZOb2RlIHx8XG4gICAgICAgIChvbGRWTm9kZS50eXBlICE9PSBMQVpZX05PREUgfHxcbiAgICAgICAgICBwcm9wc0NoYW5nZWQob2xkVk5vZGUubGF6eSwgbmV3Vk5vZGUubGF6eSkpKSAmJlxuICAgICAgICAoKG9sZFZOb2RlID0gZ2V0VGV4dFZOb2RlKG5ld1ZOb2RlLmxhenkudmlldyhuZXdWTm9kZS5sYXp5KSkpLmxhenkgPVxuICAgICAgICAgIG5ld1ZOb2RlLmxhenkpLFxuICAgICAgb2xkVk5vZGUpXG4gICAgOiBuZXdWTm9kZVxufVxuXG52YXIgY3JlYXRlVk5vZGUgPSBmdW5jdGlvbihuYW1lLCBwcm9wcywgY2hpbGRyZW4sIG5vZGUsIGtleSwgdHlwZSkge1xuICByZXR1cm4ge1xuICAgIG5hbWU6IG5hbWUsXG4gICAgcHJvcHM6IHByb3BzLFxuICAgIGNoaWxkcmVuOiBjaGlsZHJlbixcbiAgICBub2RlOiBub2RlLFxuICAgIHR5cGU6IHR5cGUsXG4gICAga2V5OiBrZXlcbiAgfVxufVxuXG52YXIgY3JlYXRlVGV4dFZOb2RlID0gZnVuY3Rpb24odmFsdWUsIG5vZGUpIHtcbiAgcmV0dXJuIGNyZWF0ZVZOb2RlKHZhbHVlLCBFTVBUWV9PQkosIEVNUFRZX0FSUiwgbm9kZSwgdW5kZWZpbmVkLCBURVhUX05PREUpXG59XG5cbnZhciByZWN5Y2xlTm9kZSA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IFRFWFRfTk9ERVxuICAgID8gY3JlYXRlVGV4dFZOb2RlKG5vZGUubm9kZVZhbHVlLCBub2RlKVxuICAgIDogY3JlYXRlVk5vZGUoXG4gICAgICAgIG5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgRU1QVFlfT0JKLFxuICAgICAgICBtYXAuY2FsbChub2RlLmNoaWxkTm9kZXMsIHJlY3ljbGVOb2RlKSxcbiAgICAgICAgbm9kZSxcbiAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICBSRUNZQ0xFRF9OT0RFXG4gICAgICApXG59XG5cbmV4cG9ydCB2YXIgTGF6eSA9IGZ1bmN0aW9uKHByb3BzKSB7XG4gIHJldHVybiB7XG4gICAgbGF6eTogcHJvcHMsXG4gICAgdHlwZTogTEFaWV9OT0RFXG4gIH1cbn1cblxuZXhwb3J0IHZhciBoID0gZnVuY3Rpb24obmFtZSwgcHJvcHMpIHtcbiAgZm9yICh2YXIgdmRvbSwgcmVzdCA9IFtdLCBjaGlsZHJlbiA9IFtdLCBpID0gYXJndW1lbnRzLmxlbmd0aDsgaS0tID4gMjsgKSB7XG4gICAgcmVzdC5wdXNoKGFyZ3VtZW50c1tpXSlcbiAgfVxuXG4gIHdoaWxlIChyZXN0Lmxlbmd0aCA+IDApIHtcbiAgICBpZiAoaXNBcnJheSgodmRvbSA9IHJlc3QucG9wKCkpKSkge1xuICAgICAgZm9yICh2YXIgaSA9IHZkb20ubGVuZ3RoOyBpLS0gPiAwOyApIHtcbiAgICAgICAgcmVzdC5wdXNoKHZkb21baV0pXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh2ZG9tID09PSBmYWxzZSB8fCB2ZG9tID09PSB0cnVlIHx8IHZkb20gPT0gbnVsbCkge1xuICAgIH0gZWxzZSB7XG4gICAgICBjaGlsZHJlbi5wdXNoKGdldFRleHRWTm9kZSh2ZG9tKSlcbiAgICB9XG4gIH1cblxuICBwcm9wcyA9IHByb3BzIHx8IEVNUFRZX09CSlxuXG4gIHJldHVybiB0eXBlb2YgbmFtZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgPyBuYW1lKHByb3BzLCBjaGlsZHJlbilcbiAgICA6IGNyZWF0ZVZOb2RlKG5hbWUsIHByb3BzLCBjaGlsZHJlbiwgdW5kZWZpbmVkLCBwcm9wcy5rZXkpXG59XG5cbmV4cG9ydCB2YXIgYXBwID0gZnVuY3Rpb24ocHJvcHMpIHtcbiAgdmFyIHN0YXRlID0ge31cbiAgdmFyIGxvY2sgPSBmYWxzZVxuICB2YXIgdmlldyA9IHByb3BzLnZpZXdcbiAgdmFyIG5vZGUgPSBwcm9wcy5ub2RlXG4gIHZhciB2ZG9tID0gbm9kZSAmJiByZWN5Y2xlTm9kZShub2RlKVxuICB2YXIgc3Vic2NyaXB0aW9ucyA9IHByb3BzLnN1YnNjcmlwdGlvbnNcbiAgdmFyIHN1YnMgPSBbXVxuXG4gIHZhciBsaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZGlzcGF0Y2godGhpcy5hY3Rpb25zW2V2ZW50LnR5cGVdLCBldmVudClcbiAgfVxuXG4gIHZhciBzZXRTdGF0ZSA9IGZ1bmN0aW9uKG5ld1N0YXRlKSB7XG4gICAgaWYgKHN0YXRlICE9PSBuZXdTdGF0ZSkge1xuICAgICAgc3RhdGUgPSBuZXdTdGF0ZVxuICAgICAgaWYgKHN1YnNjcmlwdGlvbnMpIHtcbiAgICAgICAgc3VicyA9IHBhdGNoU3VicyhzdWJzLCBiYXRjaChbc3Vic2NyaXB0aW9ucyhzdGF0ZSldKSwgZGlzcGF0Y2gpXG4gICAgICB9XG4gICAgICBpZiAodmlldyAmJiAhbG9jaykgZGVmZXIocmVuZGVyLCAobG9jayA9IHRydWUpKVxuICAgIH1cbiAgICByZXR1cm4gc3RhdGVcbiAgfVxuXG4gIHZhciBkaXNwYXRjaCA9IChwcm9wcy5taWRkbGV3YXJlIHx8XG4gICAgZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqXG4gICAgfSkoZnVuY3Rpb24oYWN0aW9uLCBwcm9wcykge1xuICAgIHJldHVybiB0eXBlb2YgYWN0aW9uID09PSBcImZ1bmN0aW9uXCJcbiAgICAgID8gZGlzcGF0Y2goYWN0aW9uKHN0YXRlLCBwcm9wcykpXG4gICAgICA6IGlzQXJyYXkoYWN0aW9uKVxuICAgICAgPyB0eXBlb2YgYWN0aW9uWzBdID09PSBcImZ1bmN0aW9uXCIgfHwgaXNBcnJheShhY3Rpb25bMF0pXG4gICAgICAgID8gZGlzcGF0Y2goXG4gICAgICAgICAgICBhY3Rpb25bMF0sXG4gICAgICAgICAgICB0eXBlb2YgYWN0aW9uWzFdID09PSBcImZ1bmN0aW9uXCIgPyBhY3Rpb25bMV0ocHJvcHMpIDogYWN0aW9uWzFdXG4gICAgICAgICAgKVxuICAgICAgICA6IChiYXRjaChhY3Rpb24uc2xpY2UoMSkpLm1hcChmdW5jdGlvbihmeCkge1xuICAgICAgICAgICAgZnggJiYgZnhbMF0oZGlzcGF0Y2gsIGZ4WzFdKVxuICAgICAgICAgIH0sIHNldFN0YXRlKGFjdGlvblswXSkpLFxuICAgICAgICAgIHN0YXRlKVxuICAgICAgOiBzZXRTdGF0ZShhY3Rpb24pXG4gIH0pXG5cbiAgdmFyIHJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICAgIGxvY2sgPSBmYWxzZVxuICAgIG5vZGUgPSBwYXRjaChcbiAgICAgIG5vZGUucGFyZW50Tm9kZSxcbiAgICAgIG5vZGUsXG4gICAgICB2ZG9tLFxuICAgICAgKHZkb20gPSBnZXRUZXh0Vk5vZGUodmlldyhzdGF0ZSkpKSxcbiAgICAgIGxpc3RlbmVyXG4gICAgKVxuICB9XG5cbiAgZGlzcGF0Y2gocHJvcHMuaW5pdClcbn1cbiIsImZ1bmN0aW9uIHN0eWxlSW5qZWN0KGNzcywgcmVmKSB7XG4gIGlmICggcmVmID09PSB2b2lkIDAgKSByZWYgPSB7fTtcbiAgdmFyIGluc2VydEF0ID0gcmVmLmluc2VydEF0O1xuXG4gIGlmICghY3NzIHx8IHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHsgcmV0dXJuOyB9XG5cbiAgdmFyIGhlYWQgPSBkb2N1bWVudC5oZWFkIHx8IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XG4gIHZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gIHN0eWxlLnR5cGUgPSAndGV4dC9jc3MnO1xuXG4gIGlmIChpbnNlcnRBdCA9PT0gJ3RvcCcpIHtcbiAgICBpZiAoaGVhZC5maXJzdENoaWxkKSB7XG4gICAgICBoZWFkLmluc2VydEJlZm9yZShzdHlsZSwgaGVhZC5maXJzdENoaWxkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICB9XG5cbiAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gIH0gZWxzZSB7XG4gICAgc3R5bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgc3R5bGVJbmplY3Q7XG4iLCJpbXBvcnQgeyBoLCBhcHAgfSBmcm9tICdoeXBlcmFwcCdcblxuaW1wb3J0ICcuL2FwcC5zY3NzJ1xuY29uc3QgYWN0aW9ucyA9IHtcblx0ZG93bjogdmFsdWUgPT4gc3RhdGUgPT4gKHsgY291bnQ6IHN0YXRlLmNvdW50IC0gdmFsdWUgfSlcbn1cblxuY29uc3Qgc3RhdGUgPSB7XG5cdGNvdW50OiAwXG59XG5cbmNvbnN0IHZpZXcgPSAoc3RhdGUsIGFjdGlvbnMpID0+IHtcblx0cmV0dXJuIChcblx0XHQ8ZGl2PlxuXHRcdFx0PGRpdiBjbGFzc05hbWU9XCJhcHBcIj50ZXN0IHNjc3M8L2Rpdj5cblx0XHRcdDxoMT57c3RhdGUuY291bnR9PC9oMT5cblx0XHRcdDxidXR0b24gb25jbGljaz17KCkgPT4gYWN0aW9ucy5kb3duKDEpfT4tPC9idXR0b24+XG5cdFx0PC9kaXY+XG5cdClcbn1cbmV4cG9ydCBjb25zdCBtYWluID0gYXBwKHN0YXRlLCBhY3Rpb25zLCB2aWV3LCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9vdCcpKVxuIl0sIm5hbWVzIjpbImFjdGlvbnMiLCJkb3duIiwidmFsdWUiLCJzdGF0ZSIsImNvdW50IiwidmlldyIsIm1haW4iLCJhcHAiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7RUFBQSxJQUFJLGFBQWEsR0FBRyxFQUFDO0VBQ3JCLElBQUksU0FBUyxHQUFHLEVBQUM7RUFDakIsSUFBSSxTQUFTLEdBQUcsRUFBQztFQUNqQixJQUFJLFNBQVMsR0FBRyxHQUFFO0VBQ2xCLElBQUksU0FBUyxHQUFHLEdBQUU7RUFDbEIsSUFBSSxHQUFHLEdBQUcsU0FBUyxDQUFDLElBQUc7RUFDdkIsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLFFBQU87RUFDM0IsSUFBSSxLQUFLO0VBQ1QsRUFBRSxPQUFPLHFCQUFxQixLQUFLLFdBQVc7RUFDOUMsTUFBTSxxQkFBcUI7RUFDM0IsTUFBTSxXQUFVOztFQUVoQixJQUFJLFdBQVcsR0FBRyxTQUFTLEdBQUcsRUFBRTtFQUNoQyxFQUFFLElBQUksR0FBRyxHQUFHLEdBQUU7O0VBRWQsRUFBRSxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsRUFBRSxPQUFPLEdBQUc7O0VBRXpDLEVBQUUsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7RUFDdEMsSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7RUFDOUMsTUFBTSxJQUFJLENBQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7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QUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDdEQsUUFBUSxRQUFRO0VBQ2hCLFFBQVEsS0FBSztFQUNiLE9BQU87RUFDUCxNQUFLO0VBQ0wsR0FBRzs7RUFFSCxFQUFFLFFBQVEsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7RUFDM0IsRUFBQzs7RUFFRCxJQUFJLE1BQU0sR0FBRyxTQUFTLElBQUksRUFBRTtFQUM1QixFQUFFLE9BQU8sSUFBSSxJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUc7RUFDdkMsRUFBQzs7RUFFRCxJQUFJLEtBQUssR0FBRyxTQUFTLE1BQU0sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFO0VBQ3hFLEVBQUUsSUFBSSxRQUFRLEtBQUssUUFBUSxFQUFFLENBQzFCLE1BQU07RUFDVCxJQUFJLFFBQVEsSUFBSSxJQUFJO0VBQ3BCLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxTQUFTO0VBQy9CLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxTQUFTO0VBQy9CLElBQUk7RUFDSixJQUFJLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLEtBQUk7RUFDdkUsR0FBRyxNQUFNLElBQUksUUFBUSxJQUFJLElBQUksSUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxJQUFJLEVBQUU7RUFDbEUsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLFlBQVk7RUFDOUIsTUFBTSxVQUFVLEVBQUUsUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxRQUFRLEVBQUUsS0FBSyxDQUFDO0VBQ2xFLE1BQU0sSUFBSTtFQUNWLE1BQUs7RUFDTCxJQUFJLElBQUksUUFBUSxJQUFJLElBQUksRUFBRTtFQUMxQixNQUFN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
