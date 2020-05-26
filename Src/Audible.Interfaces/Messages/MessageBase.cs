namespace Audible.Interfaces.Messages
{
    public abstract class MessageBase<T>
    {

        public T Data { get; private set; }
        public object Sender { get; private set; }
        public string Key { get; private set; }

        protected MessageBase()
        {
            
        }

        protected MessageBase(T data)
        {
            this.Data = data;
        }

        protected MessageBase(T data, object sender) : this(data)
        {
            this.Sender = sender;
        }

        protected MessageBase(T data, object sender, string key) : this(data, sender)
        {
            this.Key = key;
        }
    }
}