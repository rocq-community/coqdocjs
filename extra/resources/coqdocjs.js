/*jshint esversion: 6 */
import { preprocess } from "./preprocess.js";

function toArray(nl){
    return Array.prototype.slice.call(nl);
}

function proofStatus(){
  var proofs = toArray(document.getElementsByClassName("proof"));
  if(proofs.length) {
    for(var proof of proofs) {
      if (proof.getAttribute("show") === "false") {
          return "some-hidden";
      }
    }
    return "all-shown";
  }
  else {
    return "no-proofs";
  }
}

function updateView(){
  document.getElementById("toggle-proofs").setAttribute("proof-status", proofStatus());
}

function foldProofs() {
  for (const proof of toArray(document.getElementsByClassName("proof"))) {
      proof.addEventListener("click", function(proof){return function(e){
        if (e.target.parentNode.tagName.toLowerCase() === "a")
          return;
        proof.setAttribute("show", proof.getAttribute("show") === "true" ? "false" : "true");
        proof.setAttribute("animate", "");
        updateView();
      };}(proof));
      proof.setAttribute("show", "false");
  }
}

function toggleProofs(){
  var someProofsHidden = proofStatus() === "some-hidden";
  toArray(document.getElementsByClassName("proof")).forEach(function(proof){
    proof.setAttribute("show", someProofsHidden);
    proof.setAttribute("animate", "");
  });
  updateView();
}

function fixTitle(){
  let url = "/" + window.location.pathname;
  let basename = url.substring(url.lastIndexOf('/')+1, url.lastIndexOf('.'));
  if (basename === "toc") {document.title = "Table of Contents";}
  else if (basename === "indexpage") {document.title = "Index";}
  else {document.title = basename;}
}

function postprocess(){
  preprocess(document, Node);
  foldProofs();
  document.getElementById("toggle-proofs").addEventListener("click", toggleProofs);
  updateView();
}

fixTitle();
document.addEventListener('DOMContentLoaded', postprocess);
