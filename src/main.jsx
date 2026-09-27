import React, {useMemo, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {
  DndContext, DragOverlay, PointerSensor, closestCenter, useDroppable, useSensor, useSensors
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, horizontalListSortingStrategy, arrayMove
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {
  Download, ImagePlus, Plus, Trash2, Settings2, Pencil, X
} from 'lucide-react';
import './styles.css';

const COLORS = ['#000000','#ff4d6d','#ff9f1c','#ffd166','#06d6a0','#118ab2','#7c5cff','#ef476f','#64748b'];

const uid = (prefix='item') => `${prefix}-${crypto.randomUUID()}`;

const initialTiers = [
  {id: uid('tier'), name:'S', color:'#ff4d6d', items:[]},
  {id: uid('tier'), name:'A', color:'#ff9f1c', items:[]},
  {id: uid('tier'), name:'B', color:'#ffd166', items:[]},
  {id: uid('tier'), name:'C', color:'#06d6a0', items:[]},
  {id: uid('tier'), name:'D', color:'#118ab2', items:[]},
];

function getContrastColor(hex){
  const m=String(hex||'').replace('#','');
  if(m.length!==6) return '#fff';
  const r=parseInt(m.slice(0,2),16), g=parseInt(m.slice(2,4),16), b=parseInt(m.slice(4,6),16);
  const luminance=(0.299*r+0.587*g+0.114*b)/255;
  return luminance > 0.58 ? '#0b0d12' : '#ffffff';
}

function App(){
  const [title,setTitle] = useState('');
  const [tiers,setTiers] = useState(initialTiers);
  const [unranked,setUnranked] = useState([]);
  const [activeId,setActiveId] = useState(null);
  const [editingTier,setEditingTier] = useState(null);
  const [showSettings,setShowSettings] = useState(false);
  const boardRef = useRef(null);
  const fileRef = useRef(null);
  const sensors = useSensors(useSensor(PointerSensor,{activationConstraint:{distance:5}}));

  const allItems = useMemo(()=>[
    ...unranked,
    ...tiers.flatMap(t=>t.items)
  ],[unranked,tiers]);

  const activeItem = allItems.find(x=>x.id===activeId);
  const longestTierName = Math.max(1,...tiers.map(t=>t.name.length));
  const tierLabelWidth = Math.min(250, Math.max(112, 38 + longestTierName * 11));

  function addFiles(files){
    const valid = [...files].filter(f=>f.type.startsWith('image/'));
    const created = valid.map(file=>({
      id:uid(),
      src:URL.createObjectURL(file),
      name:file.name
    }));
    if(created.length) setUnranked(v=>[...v,...created]);
  }

  function removeItem(id){
    setUnranked(v=>v.filter(x=>x.id!==id));
    setTiers(v=>v.map(t=>({...t,items:t.items.filter(x=>x.id!==id)})));
  }

  function findContainer(id){
    if(id==='unranked') return 'unranked';
    if(unranked.some(x=>x.id===id)) return 'unranked';
    return tiers.find(t=>t.id===id || t.items.some(x=>x.id===id))?.id;
  }

  function handleDragStart({active}){ setActiveId(active.id); }

  function handleDragEnd({active,over}){
    setActiveId(null);
    if(!over || active.id===over.id) return;
    const from=findContainer(active.id);
    const to=findContainer(over.id);
    if(!from || !to) return;

    if(from===to){
      if(from==='unranked'){
        setUnranked(items=>arrayMove(items,items.findIndex(x=>x.id===active.id),items.findIndex(x=>x.id===over.id)));
      }else{
        setTiers(prev=>prev.map(t=>t.id===from
          ? {...t,items:arrayMove(t.items,t.items.findIndex(x=>x.id===active.id),t.items.findIndex(x=>x.id===over.id))}
          : t
        ));
      }
      return;
    }

    let moved;
    if(from==='unranked'){
      moved=unranked.find(x=>x.id===active.id);
      setUnranked(v=>v.filter(x=>x.id!==active.id));
    }else{
      moved=tiers.find(t=>t.id===from)?.items.find(x=>x.id===active.id);
      setTiers(v=>v.map(t=>t.id===from?{...t,items:t.items.filter(x=>x.id!==active.id)}:t));
    }

    if(!moved) return;

    if(to==='unranked'){
      setUnranked(v=>[...v,moved]);
    }else{
      setTiers(v=>v.map(t=>{
        if(t.id!==to) return t;
        const idx=t.items.findIndex(x=>x.id===over.id);
        const items=[...t.items];
        items.splice(idx<0?items.length:idx,0,moved);
        return {...t,items};
      }));
    }
  }

  function addTier(){
    setTiers(v=>[...v,{id:uid('tier'),name:'New',color:COLORS[v.length%COLORS.length],items:[]}]);
  }

  function deleteTier(id){
    const tier=tiers.find(t=>t.id===id);
    if(tier?.items.length) setUnranked(v=>[...v,...tier.items]);
    setTiers(v=>v.filter(t=>t.id!==id));
  }

  function updateTier(id,patch){
    setTiers(v=>v.map(t=>t.id===id?{...t,...patch}:t));
  }

  async function exportBoard(){
    try{
      const scale = 2;
      const width = 1180;
      const pad = 28;
      const headerH = 72;
      const titleH = 96;
      const rowH = 116;
      const unrankedHeadH = 42;
      const unrankedRows = Math.max(1, Math.ceil(unranked.length / 9));
      const itemSize = 92;
      const gap = 8;
      const unrankedH = unrankedHeadH + 18 + (unrankedRows * itemSize) + ((unrankedRows - 1) * gap) + 24;
      const height = pad + headerH + titleH + (tiers.length * rowH) + unrankedH + pad;

      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);

      // Background / card.
      ctx.fillStyle = '#080a0f';
      ctx.fillRect(0,0,width,height);
      roundRect(ctx, 0, 0, width, height, 16);
      ctx.fillStyle = '#0d1016';
      ctx.fill();

      // Header.
      ctx.fillStyle = '#11141b';
      ctx.fillRect(0,0,width,headerH);
      ctx.strokeStyle = '#252a34';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0,headerH+.5); ctx.lineTo(width,headerH+.5); ctx.stroke();

      ctx.fillStyle = '#f5f7fb';
      ctx.font = '700 18px Inter, Arial, sans-serif';
      ctx.fillText('Tierly', 24, 43);

      // Title.
      const displayTitle = (title || 'Name your own tier list').trim();
      ctx.fillStyle = '#f5f7fb';
      ctx.font = '700 30px Inter, Arial, sans-serif';
      ctx.fillText(displayTitle, 24, headerH + 58);

      let y = headerH + titleH;

      for(const tier of tiers){
        ctx.fillStyle = tier.color;
        ctx.fillRect(0,y,tierLabelWidth,rowH);

        const textColor = getContrastColor(tier.color);
        ctx.fillStyle = textColor;
        ctx.font = '700 25px Inter, Arial, sans-serif';
        drawCenteredWrappedText(ctx, tier.name, tierLabelWidth/2, y + rowH/2, tierLabelWidth - 16, 28);

        ctx.fillStyle = '#10131a';
        ctx.fillRect(tierLabelWidth,y,width-tierLabelWidth,rowH);
        ctx.strokeStyle = '#202530';
        ctx.beginPath(); ctx.moveTo(0,y+rowH-.5); ctx.lineTo(width,y+rowH-.5); ctx.stroke();

        let x = tierLabelWidth + 8;
        let rowY = y + 12;
        for(const item of tier.items){
          if(x + itemSize > width - 8){
            x = tierLabelWidth + 8;
            rowY += itemSize + gap;
          }
          await drawImageCover(ctx, item.src, x, rowY, itemSize, itemSize, 9);
          x += itemSize + gap;
        }
        y += rowH;
      }

      ctx.fillStyle = '#0c0f15';
      ctx.fillRect(0,y,width,unrankedH);
      ctx.fillStyle = '#9098a7';
      ctx.font = '700 11px Inter, Arial, sans-serif';
      ctx.fillText('UNRANKED', 20, y + 25);
      ctx.fillStyle = '#555e6e';
      ctx.font = '400 11px Inter, Arial, sans-serif';
      ctx.fillText(`${unranked.length} ${unranked.length===1?'item':'items'}`, 94, y + 25);

      let ux = 20, uy = y + unrankedHeadH;
      for(const item of unranked){
        if(ux + itemSize > width - 20){
          ux = 20;
          uy += itemSize + gap;
        }
        await drawImageCover(ctx, item.src, ux, uy, itemSize, itemSize, 9);
        ux += itemSize + gap;
      }

      canvas.toBlob(blob=>{
        if(!blob) throw new Error('Could not create PNG');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = `${(title || 'tier-list').trim().replace(/[^a-z0-9]+/gi,'-').toLowerCase() || 'tier-list'}.png`;
        a.href = url;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(()=>URL.revokeObjectURL(url),1000);
      }, 'image/png');
    }catch(err){
      console.error('Tier list export failed:',err);
      alert('Could not export the tier list. Please try again.');
    }
  }

  function roundRect(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
  }

  function drawCenteredWrappedText(ctx,text,cx,cy,maxWidth,lineHeight){
    const words=String(text).split(/\s+/);
    const lines=[];
    let line='';
    for(const word of words){
      const test=line ? `${line} ${word}` : word;
      if(ctx.measureText(test).width <= maxWidth || !line) line=test;
      else { lines.push(line); line=word; }
    }
    if(line) lines.push(line);
    const total=lines.length*lineHeight;
    lines.forEach((l,i)=>ctx.fillText(l,cx-ctx.measureText(l).width/2,cy-total/2+lineHeight*(i+0.8)));
  }

  function drawImageCover(ctx,src,x,y,w,h,r){
    return new Promise(resolve=>{
      const img=new Image();
      img.onload=()=>{
        ctx.save();
        roundRect(ctx,x,y,w,h,r);
        ctx.clip();
        const ratio=Math.max(w/img.naturalWidth,h/img.naturalHeight);
        const dw=img.naturalWidth*ratio, dh=img.naturalHeight*ratio;
        ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
        ctx.restore();
        resolve();
      };
      img.onerror=()=>resolve();
      img.src=src;
    });
  }

  return <div className="app">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">T</span><span>Tierly</span></div>
      <div className="top-actions">
        <button className="ghost" onClick={()=>setShowSettings(v=>!v)}><Settings2 size={17}/> Settings</button>
        <button className="export" onClick={exportBoard}><Download size={17}/> Export PNG</button>
      </div>
    </header>

    <main className="workspace">
      <section className="hero">
        <div className="eyebrow">TIER LIST MAKER</div>
        <input className="title-input" value={title} placeholder="Name your own tier list" onChange={e=>setTitle(e.target.value)} aria-label="Tier list title"/>
        <p>Rank your picks. Drag, drop, and make it yours.</p>
      </section>

      {showSettings && <div className="settings-panel">
        <div><strong>Quick controls</strong><span>Everything is stored only in this browser session.</span></div>
        <button onClick={()=>{setTitle('');setTiers(initialTiers);setUnranked([])}}>Reset list</button>
      </div>}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <section className="board-export" ref={boardRef}>
          <div className="board-header">
            <div className="board-title">{title || 'Name your own tier list'}</div>
            <button className="board-add-tier" onClick={addTier}><Plus size={17}/> Add tier</button>
          </div>

          <div className="tiers" style={{'--tier-label-width':`${tierLabelWidth}px`}}>
            {tiers.map(t=><TierRow key={t.id} tier={t} onEdit={()=>setEditingTier(t.id)} onDelete={()=>deleteTier(t.id)} onRemove={removeItem}/>)}
          </div>

          <DropZone
            id="unranked"
            className="unranked"
            nativeFileDrop
            onFiles={addFiles}
          >
            <div className="unranked-head">
              <div>
                <span className="unranked-title">UNRANKED</span>
                <span className="count">{unranked.length} {unranked.length===1?'item':'items'}</span>
              </div>
            </div>
            <SortableContext items={unranked.map(x=>x.id)} strategy={horizontalListSortingStrategy}>
              <div className="item-grid">
                {unranked.map(item=><SortableItem key={item.id} item={item} onRemove={removeItem}/>)}
                {!unranked.length && <div className="empty-unranked">Drop images here</div>}
              </div>
            </SortableContext>
          </DropZone>
        </section>

        <div className="controls">
          <button className="control-btn" onClick={()=>fileRef.current?.click()}><ImagePlus size={18}/> Add images</button>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={e=>{addFiles(e.target.files);e.target.value=''}}/>
        </div>

        <DragOverlay>
          {activeItem ? <div className="drag-preview"><img src={activeItem.src}/></div> : null}
        </DragOverlay>
      </DndContext>
    </main>

    {editingTier && <TierEditor
      tier={tiers.find(t=>t.id===editingTier)}
      onClose={()=>setEditingTier(null)}
      onSave={patch=>{updateTier(editingTier,patch);setEditingTier(null)}}
    />}

    <footer>Made for ranking things you probably have unnecessarily strong opinions about.</footer>
  </div>
}

function TierRow({tier,onEdit,onDelete,onRemove}){
  return <div className="tier-row">
    <div className="tier-label" style={{background:tier.color,color:getContrastColor(tier.color)}}>
      <button className="label-text" onClick={onEdit}>{tier.name}</button>
      <div className="label-actions">
        <button onClick={onEdit} title="Edit tier"><Pencil size={14}/></button>
        <button onClick={onDelete} title="Delete tier"><Trash2 size={14}/></button>
      </div>
    </div>
    <DropZone id={tier.id} className="tier-content">
      <SortableContext items={tier.items.map(x=>x.id)} strategy={horizontalListSortingStrategy}>
        {tier.items.map(item=><SortableItem key={item.id} item={item} onRemove={onRemove}/>) }
      </SortableContext>
      {!tier.items.length && <span className="tier-placeholder">Drop items here</span>}
    </DropZone>
  </div>
}

function DropZone({id,className,children,nativeFileDrop,onFiles}){
  const {setNodeRef,isOver}=useDroppable({id});
  const [fileOver,setFileOver]=useState(false);
  function handleDragOver(e){
    if(!nativeFileDrop) return;
    if(e.dataTransfer?.types?.includes('Files')){
      e.preventDefault();
      e.stopPropagation();
      setFileOver(true);
    }
  }
  function handleDragLeave(e){
    if(!nativeFileDrop) return;
    if(!e.currentTarget.contains(e.relatedTarget)) setFileOver(false);
  }
  function handleDrop(e){
    if(!nativeFileDrop) return;
    if(e.dataTransfer?.files?.length){
      e.preventDefault();
      e.stopPropagation();
      setFileOver(false);
      onFiles?.(e.dataTransfer.files);
    }
  }
  return <div
    ref={setNodeRef}
    className={`${className} ${isOver?'is-over':''} ${fileOver?'file-over':''}`}
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    onDrop={handleDrop}
  >{children}</div>
}

function SortableItem({item,onRemove}){
  const {attributes,listeners,setNodeRef,transform,transition,isDragging}=useSortable({id:item.id});
  const style={transform:CSS.Transform.toString(transform),transition,zIndex:isDragging?3:1};
  return <div ref={setNodeRef} style={style} className={`item ${isDragging?'dragging':''}`} {...attributes} {...listeners}>
    <img src={item.src} alt={item.name || 'Tier list item'} draggable="false"/>
    {onRemove && <button className="remove-item" onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onRemove(item.id)}}><X size={13}/></button>}
  </div>
}

function TierEditor({tier,onClose,onSave}){
  const [name,setName]=useState(tier.name);
  const [color,setColor]=useState(tier.color);
  return <div className="modal-backdrop" onMouseDown={onClose}>
    <div className="modal" onMouseDown={e=>e.stopPropagation()}>
      <div className="modal-head"><div><h2>Edit tier</h2><p>Change its name and color.</p></div><button onClick={onClose}><X/></button></div>
      <label>Tier name<input value={name} maxLength={18} onChange={e=>setName(e.target.value)}/></label>
      <label>Color<div className="color-picker">{COLORS.map(c=><button key={c} className={color===c?'selected':''} style={{background:c}} onClick={()=>setColor(c)}/>)}</div></label>
      <div className="modal-actions"><button className="ghost" onClick={onClose}>Cancel</button><button className="export" onClick={()=>onSave({name:name.trim()||'Tier',color})}>Save changes</button></div>
    </div>
  </div>
}

createRoot(document.getElementById('root')).render(<App/>);