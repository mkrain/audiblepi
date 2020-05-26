 //=============================================================================
 // Date	 : May 17, 2011
//	Author	 : Daniel Marbach
 // URL      : http://www.planetgeek.ch/2011/05/17/threadsafe-observablecollection/
 //=============================================================================

#region Using Statements

using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Diagnostics;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows;
using System.Windows.Threading;

#endregion Using Statements

namespace Coding4Fun.AppsListControl
{
    [DebuggerDisplay("Count = {Count}")]
    [ComVisible(false)]
    public class SafeObservableCollection<T> : ObservableCollection<T>
    {
        public SafeObservableCollection() : base()
        {
        }

        public SafeObservableCollection(IEnumerable collection)
        {
            foreach (T item in collection)
            {
                this.Add(item);
            }
        }

        protected override void SetItem(int index, T item)
        {
            this.ExecuteOrBeginInvoke(() => this.SetItemBase(index, item));
        }

        protected override void ClearItems()
        {
            this.ExecuteOrBeginInvoke(this.ClearItemsBase);
        }

        protected override void InsertItem(int index, T item)
        {
            this.ExecuteOrBeginInvoke(() => this.InsertItemBase(index, item));
        }

        protected override void RemoveItem(int index)
        {
            this.ExecuteOrBeginInvoke(() => this.RemoveItemBase(index));
        }

        private void RemoveItemBase(int index)
        {
            base.RemoveItem(index);
        }

        private void InsertItemBase(int index, T item)
        {
            base.InsertItem(index, item);
        }

        private void ClearItemsBase()
        {
            base.ClearItems();
        }

        private void SetItemBase(int index, T item)
        {
            base.SetItem(index, item);
        }

        private void ExecuteOrBeginInvoke(Action action)
        {
            var d = Deployment.Current.Dispatcher;
            if (d == null || d.CheckAccess())
            {
                action();
            }
            else
            {
                d.BeginInvoke(action);
            }
        }
    }
}
