import { EllipsisOutlined , PlusOutlined } from '@ant-design/icons' ;      
import type { ActionType , ProColumns } from '@ant-design/pro-components' ;       
import { ProTable , TableDropdown } from '@ant-design/pro-components' ;      
import { Button , Dropdown , Menu , Space , Tag } from 'antd' ;         
import { useRef } from 'react' ;   
import request from 'umi-request' ; 
import { ResidentResponse, useGetResidentQuery, useGetResidentsQuery } from "services/resident";
import type { Resident, ResidentResponses } from "services/resident";
import { useAppSelector } from "store/hooks";
import { selectResidents } from "state/resident/residentSlice";
import { getResidents } from 'services/resident';
import { useDeleteResidentMutation } from "services/resident";  
import { useState } from 'react';
import { useEffect } from 'react';
import { GraphQLClient, gql } from 'graphql-request'

const endpoint = process.env.REACT_APP_API_URL

const client = new GraphQLClient(endpoint, {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`}
});

const query = gql`
  query GetResidentsQuery {
    allResidents {
      id
      residentId
      roomNo
      createdAt
      updatedAt
    }
  }
`

interface MembershipProps{
  onOpen : () => void
}


const columns : ProColumns < Resident > [ ] = [   
  {
    dataIndex : 'index' , 
    valueType : 'indexBorder' , 
    width : 48 , 
  } ,
  {
    title : 'ResidentId' , 
    dataIndex : 'residentId' , 
    copyable : true , 
    ellipsis : true , 
    tip : 'The title will automatically shrink if it is too long' , 
    formItemProps : { 
      rules : [ 
        {
          required : true , 
          message : 'This item is required' , 
        } ,
      ] ,
    } ,
  } ,
  {
    disable : true , 
    title : 'RoomNo' , 
    dataIndex : 'roomNo' , 
    filters : true , 
    onFilter : true , 
    ellipsis : true , 
    valueType : 'select' , 
    valueEnum : { 
      all : { text : 'extra long'.repeat ( 50 ) } ,   
      open : { 
        text : 'unresolved' , 
        status : 'Error' , 
      } ,
      closed : { 
        text : 'resolved' , 
        status : 'Success' , 
        disabled : true , 
      } ,
      processing : { 
        text : 'solving' , 
        status : 'Processing' , 
      } ,
    } ,
  } ,
  
  {
    title : 'creation time' , 
    key : 'showTime' , 
    dataIndex : 'createdAt' , 
    valueType : 'dateTime' , 
    sorter : true , 
    hideInSearch : true , 
  } ,
  {
    title : 'creation time' , 
    dataIndex : 'updatedAt' , 
    valueType : 'dateRange' , 
    hideInTable : true , 
    search : { 
      transform : ( value ) => {   
        return { 
          startTime : value[ 0 ] ,
          endTime : value[ 1 ] ,
        } ;
      } ,
    } ,
  } ,
  {
    title : 'Operation' , 
    valueType : 'option' , 
    key : 'option' , 
    render : ( text , record , _ , action ) => [   
      
        // key ="editable"
        // onClick = { ( ) => {  
        // action?.startEditable?.(record.id);
        // }}
      <a
      key="editable"
      onClick = {()=>{
        action?.startEditable?.(record.id);
      }}
      >
        edit
      </a > ,
     
      < TableDropdown
        key = " actionGroup "
        onSelect = { ( ) => action?.reload ( ) } 
        menus = { [
          { key : 'copy' , name : 'copy' } ,   
          { key : 'delete' , name : 'delete' } ,   
        ] }
      /> ,
    ] ,
  } ,
] ;

const menu = ( 
  < Menu >
    < Menu.Item key = " 1 " > 1st item </ Menu.Item > 
    < Menu.Item key = " 2 " > 2nd item </ Menu.Item > 
    < Menu.Item key = " 3 " > 3rd item </ Menu.Item > 
  </ Menu >
) ;

export const MemberList = ( { onOpen}: MembershipProps) => {  

  const [residents, setResidents] = useState<Resident[]>([]);
  const { data: residentQuery, refetch } = useGetResidentsQuery();
  const [deleteResident] = useDeleteResidentMutation();
  const selectedResidents = useAppSelector(selectResidents);

  console.log(residentQuery)
  
  useEffect(() => {
    setResidents(selectedResidents);
  }, [selectedResidents]);

  const actionRef = useRef < ActionType > ( ) ; 
  return (
    < ProTable < Resident>
      columns = { columns }
      dataSource= {residents}
  
      actionRef = { actionRef }
      cardBordered
      request = { async ( params = { } , sort , filter ) => {    
        
         
         const response = await client.request<ResidentResponse>(query)
         
         
        
         const  result = response.allResidents
         return {
           data: result,
           success: true,
           total: result.length
         }
        
      } }
      editable = { {
        type : 'multiple' , 
      } }
      columnsState = { {
        persistenceKey : 'pro-table-singe-demos' , 
        persistenceType : 'localStorage' , 
        onChange ( value ) { 
          console.log ( 'value: ' , value ) ;
        } ,
      } }
      rowKey = "id"
      search = { {
        labelWidth : 'auto' , 
      } }
      options = { {
        setting : { 
          listsHeight : 400 , 
        } ,
      } }
      form = { {
        // Since the transform is configured, the submitted participation is different from the definition and needs to be transformed here
        syncToUrl : ( values, type ) => {   
          if ( type === 'get' ) {   
            return { 
              ... values,
              createdAt : [ values.startTime , values.endTime ] , 
            } ;
          }
          return values;
        } ,
      } }
      pagination = { {
        pageSize : 5 , 
        onChange : ( page ) => console.log ( page ) ,   
      } }
      dateFormatter = "string"
      headerTitle = "Residents"
      toolBarRender = { ( ) => [  
        < Button key = " button " icon = { < PlusOutlined /> } type = "primary" onClick={onOpen} >    
          Resident
        </ Button > ,
        < Dropdown key = " menu " overlay = { menu } >  
          < Button >
            < EllipsisOutlined /> 
          </ Button >
        </ Dropdown > ,
      ] }
    / >
  ) ;
} ;