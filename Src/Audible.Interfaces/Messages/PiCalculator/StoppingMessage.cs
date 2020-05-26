namespace Audible.Interfaces.Messages.PiCalculator
{
    public class StoppingMessage : MessageBase<int>
    {
        public StoppingMessage()
        {

        }

        public StoppingMessage(int data) : base(data)
        {

        }

        public StoppingMessage(int data, object sender) : base(data, sender)
        {

        }

        public StoppingMessage(int data, object sender, string key) : base(data, sender, key)
        {

        }
    }
}