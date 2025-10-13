/*jshint esversion: 6 */
import * as config from "./config.js";
function preprocess(document, Node) {

function replace(s){
  var m;
  if (m = s.match(/^(.+)'/)) {
    return replace(m[1])+"'";
  } else if (m = s.match(/^([A-Za-z]+)_?(\d+)$/)) {
    return replace(m[1])+m[2].replace(/\d/g, function(d){
      if (config.subscr.hasOwnProperty(d)) {
	return config.subscr[d];
      } else {
	return d;
      }
    });
  } else if (config.repl.hasOwnProperty(s)){
    return config.repl[s];
  } else {
    return s;
  }
}

function toArray(nl){
    return Array.prototype.slice.call(nl);
}

function replInTextNodes() {
  config.replInText.forEach(function(toReplace){
      document.querySelectorAll('.code, .inlinecode').forEach(function(elem){
      elem.childNodes.forEach(function(node){
	if (node.nodeType != Node.TEXT_NODE) return;
	var fragments = node.textContent.split(toReplace);
	if (fragments.length === 1) return;
	node.textContent = fragments[fragments.length-1];
	for (var k = 0; k < fragments.length - 1; ++k) {
	  node.parentNode.insertBefore(document.createTextNode(fragments[k]),node);
	  var replacement = document.createElement("span");
	  replacement.appendChild(document.createTextNode(toReplace));
	  replacement.setAttribute("class", "id");
	  replacement.setAttribute("type", "keyword");
	  node.parentNode.insertBefore(replacement, node);
	}
      });
    });
  });
}

function replNodes() {
  toArray(document.getElementsByClassName("id")).forEach(function(node){
    if (["var", "variable", "keyword", "notation", "definition", "inductive"].indexOf(node.getAttribute("type"))>=0){
      var text = node.textContent;
      var replText = replace(text);
      if(text != replText) {
	node.setAttribute("repl", replText);
	node.setAttribute("title", text);
	var hidden = document.createElement("span");
	hidden.setAttribute("class", "hidden");
	while (node.firstChild) {
	  hidden.appendChild(node.firstChild);
	}
	node.appendChild(hidden);
      }
    }
  });
}

function isVernacStart(l, t){
  t = t.trim();
  for(var s of l){
    if (t == s || t.startsWith(s+" ") || t.startsWith(s+".")){
      return true;
    }
  }
  return false;
}

function isProofStart(n){
    return isVernacStart(["Proof"], n.textContent) && !isVernacStart(["Default", "Suggest"], n.previousSibling.previousSibling.textContent) ||
	(isVernacStart(["Next"], n.textContent) && isVernacStart(["Obligation"], n.nextSibling.nextSibling.textContent));
}

function isProofEnd(s){
  return isVernacStart(["Qed", "Admitted", "Defined", "Abort"], s);
}

function tagProofs() {
  var hasCommands = true;
  var nodes = document.getElementsByClassName("command");
  if(nodes.length == 0) {
    hasCommands = false;
    console.log("no command tags found");
    nodes = document.getElementsByClassName("id");
  }
  toArray(nodes).forEach(function(node){
    if(isProofStart(node)) {
      var proof = document.createElement("span");
      proof.setAttribute("class", "proof");

      node.parentNode.insertBefore(proof, node);
      if(proof.previousSibling.nodeType === Node.TEXT_NODE)
	proof.appendChild(proof.previousSibling);
      while(node && !isProofEnd(node.textContent)) {
	proof.appendChild(node);
	node = proof.nextSibling;
      }
      if (proof.nextSibling) proof.appendChild(proof.nextSibling); // the Qed
      if (!hasCommands && proof.nextSibling) proof.appendChild(proof.nextSibling); // the dot after the Qed

    }
  });
}

function repairDom(){
  // pull whitespace out of command
  toArray(document.getElementsByClassName("command")).forEach(function(node){
    while(node.firstChild && node.firstChild.textContent.trim() == ""){
      console.log("try move");
      node.parentNode.insertBefore(node.firstChild, node);
    }
  });
  toArray(document.getElementsByClassName("id")).forEach(function(node){
    node.setAttribute("type", node.getAttribute("title"));
  });
  toArray(document.getElementsByClassName("idref")).forEach(function(ref){
    toArray(ref.childNodes).forEach(function(child){
      if (["var", "variable"].indexOf(child.getAttribute("type")) > -1)
	ref.removeAttribute("href");
    });
  });

}


repairDom();
replInTextNodes();
replNodes();
tagProofs();

}

export {preprocess};
