import { motion } from "framer-motion"

export default function FilterCard({filter,onClick}){

return(

<motion.div
className="filterCard"
whileHover={{scale:1.08}}
whileTap={{scale:0.95}}
onClick={onClick}
>

<div className="cardGlow"></div>

<h2>{filter.name}</h2>

</motion.div>

)

}