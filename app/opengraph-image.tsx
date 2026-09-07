import { ImageResponse } from 'next/og';
export const alt='8-Bit Computer — Windows, Software, Upgrades & Computer Care';
export const size={width:1200,height:630};
export const contentType='image/png';
export default function Image(){return new ImageResponse(<div style={{display:'flex',width:'100%',height:'100%',background:'#090b10',color:'#fff',padding:80,flexDirection:'column',justifyContent:'center',border:'18px solid #24344b'}}><div style={{display:'flex',color:'#86efac',fontSize:84,fontWeight:700}}>8-BIT COMPUTER</div><div style={{display:'flex',fontSize:40,marginTop:35}}>Windows · Software · Hardware Upgrades</div><div style={{display:'flex',fontSize:32,color:'#a5b4ca',marginTop:20}}>Computer Care &amp; Setup</div><div style={{display:'flex',fontSize:30,color:'#86efac',marginTop:55}}>LINE @356qitzh</div></div>,size);}
