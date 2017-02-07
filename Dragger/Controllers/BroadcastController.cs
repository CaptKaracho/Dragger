using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using Microsoft.Web.WebSockets;

namespace Dragger.Controllers
{
    public static class ExtentionMethods
    {
        public static WebSocketCollection ToCollection(this IEnumerable<WebSocketHandler> handlers)
        {
            var collection = new WebSocketCollection();

            foreach (var item in handlers)
            {
                collection.Add(item);
            }

            return collection;
        }
    }

    public class BroadcastController : ApiController
    {
        public HttpResponseMessage Get(int Group)
        {
            HttpContext.Current.AcceptWebSocketRequest(new BroadcastWebSocketHandler(Group));
            return Request.CreateResponse(HttpStatusCode.SwitchingProtocols);
        }

        private class BroadcastWebSocketHandler : WebSocketHandler
        {

            static WebSocketCollection _Clients = new WebSocketCollection();
            public int Group { get; set; }
            public BroadcastWebSocketHandler(int Group)
            {
                this.Group = Group;
            }

            public override void OnOpen()
            {
                _Clients.Add(this);
            }

            public override void OnMessage(string Message)
            {
                _Clients.Where(w => w != this && ((BroadcastWebSocketHandler) w).Group == this.Group).ToCollection().Broadcast(Newtonsoft.Json.JsonConvert.SerializeObject(new
                {
                    //user = this._Username,
                    time = string.Format("{0}", DateTime.Now.ToShortTimeString()),
                    message = Message
                }));
            }

        }

    }
}
