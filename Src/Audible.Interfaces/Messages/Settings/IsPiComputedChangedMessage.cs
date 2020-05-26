
namespace Audible.Interfaces.Messages.Settings
{
    public class IsPiComputedChangedMessage : MessageBase<bool>
    {
        public IsPiComputedChangedMessage()
        {

        }

        public IsPiComputedChangedMessage(bool data) : base(data)
        {

        }

        public IsPiComputedChangedMessage(bool data, object sender) : base(data, sender)
        {

        }

        public IsPiComputedChangedMessage(bool data, object sender, string key) : base(data, sender, key)
        {

        }
    }
}