/* eslint-disable @typescript-eslint/no-unused-vars */
// import Versions from './components/Versions'

import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar"
import { error } from "console";
interface SiteAttribute {
  desc: string;
  keywords: string;
  url: string;
  title: string;
  descDoc: string;
  keywordsDoc: string;
}
interface BlockParameters {
  is_grayscaled: 0 | 1;
  is_covered: 0 | 1;
  is_muted: 0 | 1;
}
interface BlockGroup extends BlockParameters {
  id: string;
  group_name: string;
}
interface BlockedSites {
  target_text: string,
  block_group_id: string,
}
function App(): React.JSX.Element {
  const [blockGroupData, setblockGroupData] = useState([]);
  const [blockedSitesData, setblockedSitesData] = useState([]);
  const [targetTextInput, settargetTextInput ] = useState('');
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping');   
  const targetTextPut = (): void => {
    window.electron.ipcRenderer.send('targettext/put', {target_text: targetTextInput, group_id: 1});
    window.electron.ipcRenderer.on('targettext/put/response', (event, data)=>{
      if (data.error){
        console.error("putting target text response: ", data.error);
      } else {
        console.info("inserting data success")
      }
    })
  };
  useEffect(()=>{
    window.electron.ipcRenderer.on('blockgroup/get/response', (event, data)=>{
      if (data.error) console.error("Error fetching group block: ", data.error);
      setblockGroupData(data.data);
      console.log("gorups: ", data);
    })
    window.electron.ipcRenderer.on('blockedsites/get/response', (event, data)=>{
      if (data.error) console.error("Error fetching group block: ", data.error);
      setblockedSitesData(data.data);
      console.log("sites: ", data);
    })
    window.electron.ipcRenderer.send('blockgroup/get');
    window.electron.ipcRenderer.send('blockedsites/get');
  }, []);
  return (
    <>
    {/* sidebar */}
    <Sidebar/>
    {/* for loop of all block groups */}
    {blockGroupData && blockGroupData.map((v: BlockGroup  , i)=> {
      console.log(v);
       
      return <div key={`${v.id} - ${i}`}>
        {v.group_name} <br />
        {v.is_covered}
      </div>
    })}
    <br />
    {blockedSitesData.map((v: BlockedSites  , i)=> {
      console.log(v);
       
      return <div key={`${v.target_text} - ${i} - ${v.block_group_id}`}>
        {v.target_text} <br />
        {v.block_group_id}
      </div>
    })}
    
    {/* content */}
    <span>{targetTextInput}</span>
    <input type="text" value={targetTextInput} onChange={(event: React.ChangeEvent<HTMLInputElement>)=>{
      settargetTextInput(event.target.value);
    }} />
    <button onClick={targetTextPut}></button>
    </>
  )
}

export default App
