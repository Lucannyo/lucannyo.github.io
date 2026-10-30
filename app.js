const ns='http://www.w3.org/2000/svg';
    const group=document.querySelector('#slices');
    const center=160, radius=148, dieRadius=27;
    const wallNormals=Array.from({length:8},(_,i)=>{const angle=(-90+i*45)*Math.PI/180;return [Math.cos(angle),Math.sin(angle)]});
    const wallLimit=radius*Math.cos(Math.PI/8)-dieRadius;
    for(let i=0;i<8;i++){
      const point=a=>[center+radius*Math.cos(a*Math.PI/180),center+radius*Math.sin(a*Math.PI/180)];
      const p1=point(-112.5+i*45),p2=point(-67.5+i*45);
      const slice=document.createElementNS(ns,'polygon');
      slice.setAttribute('points',`${center},${center} ${p1.join(',')} ${p2.join(',')}`);
      slice.setAttribute('class','slice');slice.dataset.sector=i+1;
      slice.setAttribute('role','button');slice.setAttribute('tabindex','0');
      slice.setAttribute('aria-label',`Setor ${i+1}`);slice.setAttribute('aria-pressed','false');
      group.append(slice);
      const mid=point(-90+i*45),label=document.createElementNS(ns,'text');
      label.setAttribute('x',center+(mid[0]-center)*83/radius);
      label.setAttribute('y',center+(mid[1]-center)*83/radius);
      label.setAttribute('class','number');label.textContent=i+1;group.append(label);
    }

    // Faceted silhouettes for the six physical polyhedron types, centered on the die's position.
    const shapes={
      4:[['-25,20 0,-25 25,20','#f5d89c'],['-25,20 0,-25 0,5','#dfaa57'],['0,-25 25,20 0,5','#eac378'],['-25,20 0,5 25,20','#c79145']],
      6:[['-23,-13 0,-25 23,-13 0,-1','#f5d89c'],['-23,-13 0,-1 0,25 -23,12','#dba14c'],['0,-1 23,-13 23,12 0,25','#eac378']],
      8:[['0,-26 23,0 0,26 -23,0','#f3cf89'],['0,-26 -23,0 0,0','#dca856'],['0,-26 23,0 0,0','#f5d99c'],['-23,0 0,26 0,0','#c88e3e'],['23,0 0,26 0,0','#e5b96a']],
      10:[['0,-27 14,-19 24,-4 18,15 0,27 -18,15 -24,-4 -14,-19','#eac378'],['0,-27 -14,-19 -8,5 0,27','#d49a47'],['0,-27 14,-19 8,5 0,27','#f5d89c'],['14,-19 24,-4 8,5','#e5b463'],['-14,-19 -24,-4 -8,5','#bd873a'],['-24,-4 -18,15 0,27 -8,5','#c89243'],['24,-4 18,15 0,27 8,5','#dbab59']],
      12:[['0,-27 23,-12 21,15 0,27 -21,15 -23,-12','#c99143'],['0,-27 23,-12 16,-4 0,-8 -16,-4 -23,-12','#f5d89c'],['-23,-12 -16,-4 -14,13 -21,15','#dfab58'],['23,-12 21,15 14,13 16,-4','#e9bd6e'],['-21,15 -14,13 0,21 14,13 21,15 0,27','#b98237'],['0,-8 16,-4 14,13 0,21 -14,13 -16,-4','#f1ce87']],
      20:[['0,-27 21,-15 27,5 13,23 -13,23 -27,5 -21,-15','#c99143'],['0,-27 -21,-15 -10,-12','#f5d89c'],['0,-27 -10,-12 10,-12','#e7b86a'],['0,-27 10,-12 21,-15','#f3d28e'],['-21,-15 -27,5 -16,3 -10,-12','#dba24d'],['21,-15 10,-12 16,3 27,5','#eabd71'],['-10,-12 -16,3 0,8','#e4af5d'],['-10,-12 10,-12 0,8','#f5d99c'],['10,-12 16,3 0,8','#efc77c'],['-27,5 -13,23 -16,3','#bc8237'],['-16,3 -13,23 0,8','#d39a46'],['16,3 0,8 13,23','#e0aa56'],['27,5 16,3 13,23','#c8903e'],['-13,23 13,23 0,8','#eabf72']]
    };
    const diceGroup=document.querySelector('#dice'),result=document.querySelector('#resultCopy');
    const roll=document.querySelector('#roll'),quantity=document.querySelector('#quantity');
    const selectionStatus=document.querySelector('#selectionStatus');
    const choices=document.querySelectorAll('.die'),slices=group.querySelectorAll('.slice');
    let sides=6,rolling=false;
    const count=()=>Math.min(10,Math.max(1,Math.floor(Number(quantity.value)||1)));
    function updateRollLabel(){roll.textContent=`ROLAR ${count()} D${sides}`;}
    quantity.addEventListener('change',()=>{quantity.value=count();updateRollLabel();});
    choices.forEach(button=>button.addEventListener('click',()=>{
      if(rolling)return;
      sides=Number(button.dataset.sides);
      choices.forEach(choice=>choice.setAttribute('aria-pressed',String(choice===button)));
      updateRollLabel();
    }));
    function highlightDie(graphic){
      const sector=Number(graphic.dataset.sector);
      const hit=sector>0 && slices[sector-1].classList.contains('selected');
      if(hit)graphic.classList.add('hit');else graphic.classList.remove('hit');
    }
    function toggleSector(slice){
      if(rolling)return;
      const threshold=Number(slice.dataset.sector);
      slices.forEach(item=>{
        const selected=Number(item.dataset.sector)>=threshold;
        if(selected)item.classList.add('selected');else item.classList.remove('selected');
        item.setAttribute('aria-pressed',String(selected));
      });
      for(const graphic of diceGroup.children)highlightDie(graphic);
      const numbers=[...slices].filter(item=>item.classList.contains('selected')).map(item=>item.dataset.sector);
      selectionStatus.textContent=numbers.length?`Setores selecionados: ${numbers.join(', ')}.`:'Nenhum setor selecionado.';
    }
    slices.forEach(slice=>{
      slice.addEventListener('click',()=>toggleSector(slice));
      slice.addEventListener('keydown',event=>{
        if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleSector(slice);}
      });
    });
    const sectorAt=(x,y)=>Math.floor(((Math.atan2(y-center,x-center)*180/Math.PI+112.5+360)%360)/45)+1;
    function keepInside(die){
      let moved=false;
      for(const [nx,ny] of wallNormals){
        const overflow=(die.x-center)*nx+(die.y-center)*ny-wallLimit;
        if(overflow>0){
          moved=true;
          die.x-=overflow*nx;die.y-=overflow*ny;
          const speed=die.vx*nx+die.vy*ny;
          if(speed>0){die.vx-=1.8*speed*nx;die.vy-=1.8*speed*ny;}
        }
      }
      return moved;
    }
    function separate(a,b){
      let dx=b.x-a.x,dy=b.y-a.y;
      const squared=dx*dx+dy*dy;
      if(squared>=(dieRadius*2-0.01)**2)return false;
      let distance=Math.sqrt(squared);
      if(distance<0.001){dx=1;dy=0;distance=1;}
      const nx=dx/distance,ny=dy/distance,overlap=(dieRadius*2-distance)/2;
      a.x-=nx*overlap;a.y-=ny*overlap;b.x+=nx*overlap;b.y+=ny*overlap;
      const speed=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
      if(speed<0){
        const impulse=-(1+0.8)*speed/2;
        a.vx-=impulse*nx;a.vy-=impulse*ny;
        b.vx+=impulse*nx;b.vy+=impulse*ny;
      }
      return true;
    }
    function makeDie(index,cols,rows,total,rolledSides){
      const row=Math.floor(index/cols),rowSize=Math.min(cols,total-row*cols);
      const x=center+(index%cols-(rowSize-1)/2)*56;
      const y=center+(row-(rows-1)/2)*56;
      const graphic=document.createElementNS(ns,'g');
      graphic.setAttribute('class','die-graphic');
      const shape=document.createElementNS(ns,'g');shape.setAttribute('class','die-shape');
      shape.replaceChildren(...shapes[rolledSides].map(([points,fill])=>{
        const face=document.createElementNS(ns,'polygon');
        face.setAttribute('points',points);face.setAttribute('fill',fill);return face;
      }));
      const text=document.createElementNS(ns,'text');text.setAttribute('class','die-value');
      text.setAttribute('x','0');text.setAttribute('y','0');
      graphic.append(shape,text);diceGroup.append(graphic);
      const direction=Math.random()*Math.PI*2;
      return {x,y,vx:Math.cos(direction)*6,vy:Math.sin(direction)*6,angle:0,
        value:Math.floor(Math.random()*rolledSides)+1,graphic,text};
    }
    roll.addEventListener('click',()=>{
      if(rolling)return;
      const total=count(),rolledSides=sides;
      quantity.value=total;updateRollLabel();
      rolling=true;roll.disabled=true;quantity.disabled=true;
      choices.forEach(choice=>choice.disabled=true);
      slices.forEach(slice=>{slice.classList.remove('landed');slice.setAttribute('aria-disabled','true');});
      diceGroup.replaceChildren();
      diceGroup.classList.add('is-rolling');
      const cols=Math.ceil(Math.sqrt(total)),rows=Math.ceil(total/cols);
      const dice=Array.from({length:total},(_,index)=>makeDie(index,cols,rows,total,rolledSides));
      result.textContent=`Rolando ${total} ${total===1?'dado':'dados'} d${rolledSides}…`;
      const started=performance.now();
      let last=started,numberElapsed=0;
      function frame(now){
        const delta=now-last;last=now;numberElapsed+=delta;
        // Limit catch-up after a suspended tab while keeping collision steps small.
        let remaining=Math.min(delta/16.67,6);
        while(remaining>0){
          const step=Math.min(remaining,1);remaining-=step;
          for(const die of dice){die.x+=die.vx*step;die.y+=die.vy*step;}
          for(let pass=0;pass<10;pass++){
            let changed=false;
            for(let i=0;i<dice.length;i++)for(let j=i+1;j<dice.length;j++){
              if(separate(dice[i],dice[j]))changed=true;
            }
            for(const die of dice)if(keepInside(die))changed=true;
            if(!changed)break;
          }
          const drag=Math.pow(0.987,step);
          for(const die of dice){
            die.vx*=drag;die.vy*=drag;
            die.angle+=Math.sqrt(die.vx*die.vx+die.vy*die.vy)*step*7;
          }
        }
        for(const die of dice){
          die.graphic.setAttribute('transform',`translate(${die.x} ${die.y}) rotate(${die.angle})`);
        }
        if(numberElapsed>90){
          dice.forEach(die=>{die.text.textContent=Math.floor(Math.random()*rolledSides)+1;});
          numberElapsed=0;
        }
        if(now-started<2600){requestAnimationFrame(frame);return;}
        diceGroup.classList.remove('is-rolling');
        const details=dice.map((die,index)=>{
          die.graphic.setAttribute('transform',`translate(${die.x} ${die.y})`);
          die.text.textContent=die.value;
          const sector=sectorAt(die.x,die.y);
          die.graphic.dataset.sector=sector;
          highlightDie(die.graphic);
          slices[sector-1].classList.add('landed');
          return `${index+1}: ${die.value} (setor ${sector})`;
        });
        result.replaceChildren(document.createTextNode(`Resultado no d${rolledSides}`));
        const detail=document.createElement('strong');
        detail.textContent=details.join(' · ');result.append(detail);
        rolling=false;roll.disabled=false;quantity.disabled=false;
        choices.forEach(choice=>choice.disabled=false);
        slices.forEach(slice=>slice.removeAttribute('aria-disabled'));
      }
      requestAnimationFrame(frame);
    });
