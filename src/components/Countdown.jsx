import { useEffect,useState } from "react"

export default function Countdown({onComplete}){

const [count,setCount] = useState(3)

useEffect(()=>{

if(count===1){

onComplete()
return

}

const timer = setTimeout(()=>{
setCount(count-1)
},1000)

return ()=>clearTimeout(timer)

},[count])

return(

<div className="countdownOverlay">

<div className="countNumber">
{count}
</div>

</div>

)

}