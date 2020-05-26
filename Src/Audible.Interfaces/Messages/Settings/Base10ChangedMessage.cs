
namespace Audible.Interfaces.Messages.Settings
{
    public class Base10ChangedMessage : MessageBase<bool>
    {
        public Base10ChangedMessage()
        {

        }

        public Base10ChangedMessage(bool data) : base(data)
        {

        }

        public Base10ChangedMessage(bool data, object sender) : base(data, sender)
        {

        }

        public Base10ChangedMessage(bool data, object sender, string key) : base(data, sender, key)
        {

        }
    }
}