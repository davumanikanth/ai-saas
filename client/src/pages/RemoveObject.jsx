import { Edit, Edit2, Eraser, Hash, Scissors, ScissorsIcon, Sparkles } from 'lucide-react'
import React, {  useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import Markdown from "react-markdown";
axios.defaults.baseURL=import.meta.env.VITE_BASE_URL;


const RemoveObject = () => {
  
    const [input,setInput]=useState('')
    const [object,setObject]=useState('')
  //After backend
          const[loading,setLoading]=useState(false);
          const[content,setContent]=useState('')
        
          const {getToken}=useAuth();
  
    const onSubmitHandler=async(e)=>  {
      e.preventDefault()

        try{
        setLoading(true)
        if(object.split(' ').length>1)
        {
          return toast('please enter only one object name')
        }
        const formData=new FormData()
        formData.append('image',input)
        formData.append('object',object)


        const {data}=await axios.post('/api/ai/remove-image-object',
        formData,
        {headers:{Authorization:`Bearer ${await getToken()}`}})
       
        if(data.success)
        {
        setContent(data.content)
        toast.success('object from Image  remvoed successfully!')

        }else{
          toast.error(data.message)

        }

      }
      catch(error)
      {
        toast.error(error.message)

      }
      finally{
      setLoading(false)
      }


}
  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      {/* left col */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#aa2830]' />
          <h1 className='text-xl font-semibold'>Object Remover</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Upload Image</p>





        <input onChange={(e)=>setInput(e.target.files[0])} type='file' 
        className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md  border border-gray-300 text-gray-600' 
        accept='image/*' required/>


<p className='mt-6 text-sm font-medium'>Describe the Object to be removed</p>





        <textarea onChange={(e)=>setObject(e.target.value)} type='text' 
        value={object}
        className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md  border border-gray-300' 
        placeholder='Describe what you want to remove in the image'
        row={4}
        required />

        
        <button disabled={loading} className='mt-6 bg-gradient-to-br from-[#c72f60] to-[#bc2341] text-white px-35 py-2 rounded-lg flex items-center gap-2 hover:scale-102 active:scale-95 transition cursor-pointer'>
          {loading? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
          : 
          <ScissorsIcon className='w-5' /> }
          Remove Background
        </button>
      </form>





      {/* right col */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]'>
        <div className='flex items-center gap-3'>
          <Scissors className='w-6 text-[#e03333]' />
          <h1 className='text-xl font-semibold'>Processed Image</h1>
        </div>

      
              {!content? (
                 <div className='flex-1 flex justify-center items-center'>
          <div className='text-sm flex flex-col items-center gap-5'>

                       <Scissors className='w-9 h-9  ' />
            <p className='text-gray-500'>Upload any image that you want to Removed Object from image</p>
          </div>

        </div>
      
              ):(
      
                <img className='mt-3 w-full h-full' src={content} alt="" />
              )}



       

      </div>
    </div>
  )
}

export default RemoveObject
