import { Edit, Edit2, Eraser, EraserIcon, FileText, FileTextIcon, Hash, LucideFileText, Sparkles } from 'lucide-react'
import React, {  useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import Markdown from "react-markdown";
import { toast } from 'react-hot-toast';
axios.defaults.baseURL=import.meta.env.VITE_BASE_URL;


const ReviewResume = () => {
  const [input,setInput]=useState('')
  //After backend
            const[loading,setLoading]=useState(false);
            const[content,setContent]=useState('')
          
            const {getToken}=useAuth();
  
    const onSubmitHandler=async(e)=>  {
      e.preventDefault()
 try{
        setLoading(true)
       
        const formData=new FormData()
        formData.append('resume',input)


        const {data}=await axios.post('/api/ai/resume-review',
        formData,
        {headers:{Authorization:`Bearer ${await getToken()}`}})
       
        if(data.success)
        {
        setContent(data.content)
        toast.success('resume review successfully!')

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
          <Sparkles className='w-6 text-[#53c7dc]' />
          <h1 className='text-xl font-semibold'>Resume Review</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Upload resume</p>





        <input onChange={(e)=>setInput(e.target.files[0])} type='file' 
        className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md  border border-gray-300 text-gray-600' 
        accept='application/pdf' required/>


         <p className='text-xs text-gray-500 font-light mt-1'>Support PDF resume only</p>


        
        <button disabled={loading} className='mt-6 bg-gradient-to-br from-[#2ab6c8] to-[#01b5f7] text-white px-35 py-2 rounded-lg flex items-center gap-2 hover:scale-102 active:scale-95 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'>
          <FileText className='w-5' />
          {loading ? 'Reviewing...' : 'Review Resume'}
        </button>
      </form>





      {/* right col */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]'>
        <div className='flex items-center gap-3'>
          <FileTextIcon className='w-6 text-[#1be3ed]' />
          <h1 className='text-xl font-semibold'>Analysis Results</h1>
        </div>

  {loading ? (
     <div className='flex-1 flex justify-center items-center'>
          <div className='text-sm flex flex-col items-center gap-5'>
            <div className='animate-spin'>
              <Sparkles className='w-9 h-9 text-[#53c7dc]' />
            </div>
            <p className='text-gray-500'>Analyzing your resume...</p>
          </div>
        </div>
  ) : !content? (
     <div className='flex-1 flex justify-center items-center'>
          <div className='text-sm flex flex-col items-center gap-5'>

                       <LucideFileText className='w-9 h-9  ' />
            <p className='text-gray-500'>Upload a resume and click "Review Resume" to get Started</p>
          </div>

        </div>

                 
      
              ):(
                 <Markdown >
                {content}
                </Markdown>
              )}

       
      </div>
    </div>
  )
}

export default ReviewResume
