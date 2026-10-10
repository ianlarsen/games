/* Pointer identities keep simultaneous thumb inputs independent. */
(function(root){
  function createInput(){
    const held={left:false,right:false,jump:false,dash:false,fire:false};
    const taps={jump:false,dash:false,fire:false};
    const pointers=new Map();
    function refresh(){Object.keys(held).forEach(key=>{held[key]=Array.from(pointers.values()).includes(key);});}
    return {
      held,taps,
      down(id,key){if(!(key in held))return;pointers.set(id,key);refresh();if(key in taps)taps[key]=true;},
      up(id){pointers.delete(id);refresh();},
      reset(){pointers.clear();Object.keys(held).forEach(k=>held[k]=false);this.consume();},
      consume(){Object.keys(taps).forEach(k=>taps[k]=false);}
    };
  }
  if(typeof module==='object'&&module.exports)module.exports={createInput};else root.SpaceInput={createInput};
})(typeof window==='object'?window:{});
