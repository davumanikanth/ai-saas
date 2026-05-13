import React, { useState } from 'react'

const CreationItem = ({item}) => {
 

    const [expanded,setExpanded]=useState(false)



  return (
    <div onClick={()=>setExpanded(!expanded)} className='p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg cursor-pointer'>
       <div className='flex justify-between items-center gap-4'>
        <div>
        <h2>{item.prompt}</h2>
        <p>{item.type}-{new Date(item.created_at).toLocaleDateString()}</p>
       </div>
       <button className='bg-[#EFF6FF border border-[#BFDBFE] text-[#1E40AF] px-4 py-1 rounded-full'>{item.type}</button>
    </div>
    {
        expanded && (
            <div>
                {item.type==='image'? (<div> <img src={item.content} className='mt-3 w-full max-w-md'></img></div>)
                                    : (<div className='mt-3 p-3 bg-gray-100 rounded-lg whitespace-pre-wrap'>{item.content}</div>)}
            </div>
        )
    }
    </div>
  )
}

export default CreationItem
