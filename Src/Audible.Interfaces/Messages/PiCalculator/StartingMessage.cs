namespace Audible.Interfaces.Messages.PiCalculator
{
    public class StartingMessage : MessageBase<int>
    {
        public StartingMessage()
        {

        }

        public StartingMessage(int data) : base(data)
        {

        }

        public StartingMessage(int data, object sender) : base(data, sender)
        {

        }

        public StartingMessage(int data, object sender, string key) : base(data, sender, key)
        {

        }
    }
}