import { EllipsisOutlined , PlusOutlined } from '@ant-design/icons' ;      
import type { ActionType , ProColumns } from '@ant-design/pro-components' ;       
import { ProTable , TableDropdown } from '@ant-design/pro-components' ;      
import { Button , Dropdown , Menu , Space , Tag } from 'antd' ;         
import { useEffect, useRef, useState } from 'react' ;   
import request from 'umi-request' ;

import { GraphQLClient, gql } from 'graphql-request'
import type { EventResponse, Event } from 'services/event';
import { useAppSelector } from 'store/hooks';
import { selectEvents } from 'state/event/eventSlice';
import { useGetEventsQuery } from 'services/event';
const endpoint = process.env.REACT_APP_API_URL

const client = new GraphQLClient(endpoint, {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`}
});

const query = gql`
  query GetEventsQluery {
    allEvents {
      id
      title
      description
      createdAt
      updatedAt
    }
  }
`
interface MembershipProps{
  onOpen : () => void
}






const columns : ProColumns < Event > [ ] = [   
  {
    dataIndex : 'index' , 
    valueType : 'indexBorder' , 
    width : 48 , 
  } ,
  {
    title : 'Event Title' , 
    dataIndex : 'title' , 
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
    title : 'Description' , 
    dataIndex : 'description' , 
    filters : true , 
    onFilter : true , 
    ellipsis : true , 
    valueType : 'select' , 
    valueEnum : { 
      all : { text : 'extra long' } ,   
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
    disable : true , 
    title : 'Photos' , 
    dataIndex : 'photos' , 
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
    disable : true , 
    title : 'Songs' , 
    dataIndex : 'songs' , 
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
    dataIndex : 'created_at' , 
    valueType : 'dateTime' , 
    sorter : true , 
    hideInSearch : true , 
  } ,
  {
    title : 'creation time' , 
    dataIndex : 'created_at' , 
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
        // action?.startEditable?.(record.id);
      }}
      >
        edit
      </a > ,
      < a href = { "" } target = " _blank " rel = " noopener noreferrer " key = " view " >    
        Check
      </ a > ,
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

export const EventList = ( { onOpen}: MembershipProps) => {  
    const {data: eventsQuery, refetch } = useGetEventsQuery()

    const selectedEvents = useAppSelector(selectEvents)
    const [events, setEvents] = useState<Event[]>()


    useEffect(() => {
       
       setEvents(selectedEvents)
    }, [selectedEvents])
  
  const actionRef = useRef < ActionType > ( ) ; 
  return (
    < ProTable < Event >
      columns = { columns }
      dataSource={events}
      
      actionRef = { actionRef }
      cardBordered
      
      request = { async ( params = { } , sort , filter ) => {    
        
        const response = await client.request<EventResponse>(query)
        const  result = response.allEvents
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
          // console. log ( 'value: ' , value ) ;
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
              created_at : [ values.startTime , values.endTime ] , 
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
          Event
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