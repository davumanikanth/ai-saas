import { Edit, Edit2, Hash, Image, ImageDown, ImageIcon, Sparkles } from 'lucide-react'
import React, {  useState } from 'react'
import {toast} from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import Markdown from "react-markdown";
axios.defaults.baseURL=import.meta.env.VITE_BASE_URL;

const GenerateImages = () => {
  
   const imageStyle=['Realistic','Ghibli style','Anime style','Cartoon style','Fantasy style','Realistic style','3D style','Portrait style']
  
    const [selectedStyle,setSelectedStyle]=useState('Realistic')
    const [input,setInput]=useState('')
    const [publish,setPublish]=useState(false)
  //afteerbackend
  //After backend
    const[loading,setLoading]=useState(false);
    const[content,setContent]=useState('')
  
    const {getToken}=useAuth();
  

  
    const onSubmitHandler=async(e)=>  {
      e.preventDefault()
      

      try{
        setLoading(true)
        const prompt=`Generate an image of ${input } in the style ${selectedStyle}`

        const {data}=await axios.post('/api/ai/generate-image',
          {prompt,publish},
        {headers:{Authorization:`Bearer ${await getToken()}`}})
       
        if(data.success)
        {
        setContent(data.content)
        toast.success('Image generated successfully!')

        }else{
          toast.error(data.message)

        }

      }catch(error)
      {
        toast.error(error.response?.data?.message || 'Failed to generate image')
      }finally{
        setLoading(false)
      }

    }
  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      {/* left col */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#00AD25]' />
          <h1 className='text-xl font-semibold'>AI Image Generation</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Describe Your Image</p>





        <textarea onChange={(e)=>setInput(e.target.value)} type='text' 
        className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md  border border-gray-300' 
        placeholder='Describe what you want to see in the image'
        row={4}
        required />

        <p className='mt-4 text-sm font-medium '> Style</p>




        <div className={`mt-3 flex gap-3 flex-wrap sm:max-w-[89%] `}>
          {imageStyle.map((item)=>(
            <span onClick={()=>setSelectedStyle(item)} 
            key={item} 
            className={`text-xs px-4 py-1 border rounded-full cursor-pointer 
            ${selectedStyle===item ? 'bg-green-50 text-green-700'  :'text-gray-500 border-gray-300' }`}>
              {item}
              </span>
          ))}



        </div>

       <div className='my-6 flex items-center gap-2'>
        <label className='relative cursor-pointer'>
          <input type="checkbox" onChange={(e)=>setPublish(e.target.checked)}
          checked={publish} className='sr-only peer' />
          <div className='w-9 h-5 bg-slate-300 rounded-full 
          peer-checked:bg-green-500 transition'></div>

          <span className='absolute left-1 top-1 w-3 h-3 bg-white  
          rounded-full transition peer-checked:translate-x-4 '></span>
        </label>
       </div>




        <br />
        <button disabled={loading} className='mt-6 bg-gradient-to-br from-[#26c66b] to-[#07d63e] text-white px-40 py-2 rounded-lg flex items-center gap-2 hover:scale-102 active:scale-95 transition cursor-pointer'>
          {loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
          :          <Image className='w-5' />
}
          
           Generate Image
        </button>
      </form>





      {/* right col */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]'>
        <div className='flex items-center gap-3'>
          <Image className='w-6 text-[#5ee9a2]' />
          <h1 className='text-xl font-semibold'>Generated title</h1>
        </div>
         {!content ?(
          <div className='flex-1 flex justify-center items-center'>
          <div className='text-sm flex flex-col items-center gap-5'>

                       <ImageDown className='w-9 h-9  ' />
            <p className='text-gray-500'>Your Generted Image .</p>
          </div>

        </div>
         ):(
          <div className='mt-3 h-64'>
            <img src={content} alt="" className='w-full h-full object-cover' />
          </div>
         )}
        

      </div>
    </div>
  )
}

export default GenerateImages
