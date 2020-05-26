
namespace Audible.Interfaces.Messages.PiCalculator
{
    public class CanceledMessage : MessageBase<bool>
    {
        public CanceledMessage()
        {

        }

        public CanceledMessage(bool data) : base(data)
        {

        }

        public CanceledMessage(bool data, object sender) : base(data, sender)
        {

        }

        public CanceledMessage(bool data, object sender, string key) : base(data, sender, key)
        {

        }
    }
}