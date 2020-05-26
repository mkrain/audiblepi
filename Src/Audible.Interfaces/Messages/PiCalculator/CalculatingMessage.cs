
namespace Audible.Interfaces.Messages.PiCalculator
{
    public class CalculatingMessage : MessageBase<int>
    {
        public CalculatingMessage()
        {

        }

        public CalculatingMessage(int data) : base(data)
        {

        }

        public CalculatingMessage(int data, object sender) : base(data, sender)
        {

        }

        public CalculatingMessage(int data, object sender, string key) : base(data, sender, key)
        {

        }
    }
}